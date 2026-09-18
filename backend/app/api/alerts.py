import datetime
import random
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc

from app.db.session import get_db
from app.db.models import Alert, Incident, IncidentEvent, AuditLog, MitreTechnique
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertActionRequest(BaseModel):
    action: str  # 'acknowledge', 'assign', 'investigate', 'resolve', 'suppress'
    assigned_to: Optional[str] = None
    note: Optional[str] = None

class EscalateAlertRequest(BaseModel):
    notes: Optional[str] = None
    assigned_to: Optional[str] = "analyst@spectrum.internal"
    severity: Optional[str] = None

@router.get("")
async def list_alerts(db: AsyncSession = Depends(get_db)):
    """
    Returns alerts from the persistent store merged with any active simulation alerts.
    """
    stmt = select(Alert).order_by(desc(Alert.timestamp)).limit(100)
    result = await db.execute(stmt)
    db_alerts = result.scalars().all()

    alert_list = []
    seen_codes = set()

    for a in db_alerts:
        seen_codes.add(a.alert_code)
        alert_list.append({
            "id": a.id,
            "alert_code": a.alert_code,
            "timestamp": a.timestamp.isoformat() + "Z" if a.timestamp else datetime.datetime.utcnow().isoformat() + "Z",
            "severity": a.severity,
            "status": a.status,
            "title": a.title,
            "category": a.category,
            "source_ip": a.source_ip,
            "destination_ip": a.destination_ip,
            "mitre_technique_id": a.mitre_technique_id,
            "attack_probability": a.attack_probability,
            "confidence": a.confidence,
            "assigned_to": a.assigned_to or "SOC Tier 1 Queue",
            "description": a.description,
            "analyst_notes": a.analyst_notes,
            "is_simulated": a.is_simulated
        })

    # Merge in simulation engine alerts if not already in DB
    for sim_alert in simulation_engine.generated_alerts:
        if sim_alert.get("alert_code") not in seen_codes:
            seen_codes.add(sim_alert.get("alert_code"))
            alert_list.insert(0, sim_alert)

    return alert_list

@router.get("/{alert_id}")
async def get_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if alert:
        return {
            "id": alert.id,
            "alert_code": alert.alert_code,
            "timestamp": alert.timestamp.isoformat() + "Z" if alert.timestamp else "",
            "severity": alert.severity,
            "status": alert.status,
            "title": alert.title,
            "category": alert.category,
            "source_ip": alert.source_ip,
            "destination_ip": alert.destination_ip,
            "mitre_technique_id": alert.mitre_technique_id,
            "attack_probability": alert.attack_probability,
            "confidence": alert.confidence,
            "assigned_to": alert.assigned_to,
            "description": alert.description,
            "analyst_notes": alert.analyst_notes,
            "is_simulated": alert.is_simulated
        }

    for sim_alert in simulation_engine.generated_alerts:
        if sim_alert.get("id") == alert_id:
            return sim_alert

    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/action")
async def update_alert_status(alert_id: int, body: AlertActionRequest, db: AsyncSession = Depends(get_db)):
    new_status = "Open"
    if body.action == "acknowledge":
        new_status = "Acknowledged"
    elif body.action == "investigate":
        new_status = "Investigating"
    elif body.action == "resolve":
        new_status = "Resolved"
    elif body.action == "suppress":
        new_status = "Suppressed"

    # Update in DB
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")
    note_append = f"\n[{now_str}] [{body.action.upper()}]: {body.note}" if body.note else ""

    if alert:
        alert.status = new_status
        if body.assigned_to:
            alert.assigned_to = body.assigned_to
        if note_append:
            alert.analyst_notes = (alert.analyst_notes or "") + note_append

        # Audit log
        audit = AuditLog(
            username=body.assigned_to or "analyst.soc",
            role="Analyst",
            action=f"ALERT_{body.action.upper()}",
            resource_type="Alert",
            resource_id=alert.alert_code,
            details={"action": body.action, "note": body.note, "status": new_status}
        )
        db.add(audit)
        await db.commit()
        await db.refresh(alert)

    # Also update simulation cache if present
    for sim_alert in simulation_engine.generated_alerts:
        if sim_alert.get("id") == alert_id:
            sim_alert["status"] = new_status
            if body.assigned_to:
                sim_alert["assigned_to"] = body.assigned_to
            if note_append:
                sim_alert["analyst_notes"] = (sim_alert.get("analyst_notes") or "") + note_append

    return {"status": "success", "alert_id": alert_id, "new_status": new_status}

@router.post("/{alert_id}/escalate")
async def escalate_alert_to_incident(alert_id: int, body: EscalateAlertRequest, db: AsyncSession = Depends(get_db)):
    """
    Escalates an Alert into a formal security Incident with correlated timeline and evidence.
    """
    # Find alert in DB or simulation engine
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    alert_data = None
    if alert:
        alert_data = {
            "alert_code": alert.alert_code,
            "title": alert.title,
            "severity": alert.severity,
            "source_ip": alert.source_ip,
            "destination_ip": alert.destination_ip,
            "category": alert.category,
            "mitre_technique_id": alert.mitre_technique_id,
            "confidence": alert.confidence or 0.94,
            "is_simulated": alert.is_simulated
        }
    else:
        for a in simulation_engine.generated_alerts:
            if a.get("id") == alert_id:
                alert_data = a
                break

    if not alert_data:
        raise HTTPException(status_code=404, detail="Alert not found for escalation")

    now = datetime.datetime.utcnow()
    date_code = now.strftime("%Y-%m%d")
    random_suffix = random.randint(1000, 9999)
    incident_number = f"INC-{date_code}-{random_suffix}"

    severity = body.severity or alert_data.get("severity", "High")
    affected_assets = list(filter(None, [alert_data.get("destination_ip"), alert_data.get("source_ip")]))

    new_incident = Incident(
        incident_number=incident_number,
        title=f"Escalated from {alert_data.get('alert_code')}: {alert_data.get('title')}",
        severity=severity,
        status="Investigating",
        confidence=float(alert_data.get("confidence", 0.94)),
        first_detected=now,
        last_activity=now,
        affected_assets=affected_assets,
        ai_prediction=alert_data.get("category", "Network Threat"),
        mitre_technique_id=alert_data.get("mitre_technique_id") or "T1498",
        recommended_actions=[
            "Isolate compromised host from production segment",
            "Deploy deep packet capture on ingress interface",
            "Review border firewall telemetry and egress ACLs"
        ],
        analyst_notes=f"Escalated by analyst from alert {alert_data.get('alert_code')}.\nNote: {body.notes or 'No initial note specified.'}",
        assigned_analyst=body.assigned_to or "analyst@spectrum.internal",
        is_simulated=alert_data.get("is_simulated", True)
    )
    db.add(new_incident)
    await db.flush()

    # Create initial IncidentEvent
    initial_event = IncidentEvent(
        incident_id=new_incident.id,
        event_time=now,
        event_type="ESCALATION",
        description=f"Alert {alert_data.get('alert_code')} escalated to incident {incident_number}.",
        evidence={
            "source_ip": alert_data.get("source_ip"),
            "destination_ip": alert_data.get("destination_ip"),
            "original_alert": alert_data.get("alert_code"),
            "notes": body.notes
        },
        created_by=body.assigned_to or "analyst@spectrum.internal"
    )
    db.add(initial_event)

    # Create audit log entry
    audit = AuditLog(
        username=body.assigned_to or "analyst.soc",
        role="Analyst",
        action="ESCALATE_ALERT_TO_INCIDENT",
        resource_type="Incident",
        resource_id=incident_number,
        details={
            "original_alert": alert_data.get("alert_code"),
            "severity": severity,
            "affected_assets": affected_assets
        }
    )
    db.add(audit)

    # Update alert status to Investigating
    if alert:
        alert.status = "Investigating"
        alert.analyst_notes = (alert.analyst_notes or "") + f"\n[ESCALATED]: Escalated to {incident_number}"

    await db.commit()
    await db.refresh(new_incident)

    # Also register into simulation engine cache for live dashboard counter sync
    sim_inc_repr = {
        "id": new_incident.id,
        "incident_number": incident_number,
        "title": new_incident.title,
        "severity": severity,
        "status": "Investigating",
        "confidence": new_incident.confidence,
        "first_detected": now.isoformat() + "Z",
        "last_activity": now.isoformat() + "Z",
        "affected_assets": affected_assets,
        "ai_prediction": new_incident.ai_prediction,
        "mitre_technique_id": new_incident.mitre_technique_id,
        "recommended_actions": new_incident.recommended_actions,
        "analyst_notes": new_incident.analyst_notes,
        "assigned_analyst": new_incident.assigned_analyst,
        "is_simulated": new_incident.is_simulated,
        "timeline": [
            {"time": now.strftime("%H:%M:%S UTC"), "event": f"Escalated from Alert {alert_data.get('alert_code')}"}
        ]
    }
    simulation_engine.generated_incidents.insert(0, sim_inc_repr)

    return {
        "status": "escalated",
        "incident_number": incident_number,
        "incident_id": new_incident.id,
        "incident": sim_inc_repr
    }
