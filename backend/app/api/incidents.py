import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload, joinedload

from app.db.session import get_db
from app.db.models import Incident, IncidentEvent, MitreTechnique, TrafficEvent, AuditLog
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/incidents", tags=["Incidents"])

class NoteRequest(BaseModel):
    note: str
    author: Optional[str] = "analyst@spectrum.internal"

class StatusUpdateRequest(BaseModel):
    status: str  # 'Open', 'Investigating', 'Contained', 'Resolved'
    author: Optional[str] = "analyst@spectrum.internal"

@router.get("")
async def list_incidents(db: AsyncSession = Depends(get_db)):
    """
    Returns list of all formal incidents from database and simulation engine.
    """
    stmt = (
        select(Incident)
        .options(joinedload(Incident.mitre_technique), selectinload(Incident.events))
        .order_by(desc(Incident.first_detected))
        .limit(100)
    )
    result = await db.execute(stmt)
    db_incidents = result.scalars().all()

    incident_list = []
    seen_numbers = set()

    for inc in db_incidents:
        seen_numbers.add(inc.incident_number)
        incident_list.append({
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "confidence": inc.confidence,
            "first_detected": inc.first_detected.isoformat() + "Z" if inc.first_detected else "",
            "last_activity": inc.last_activity.isoformat() + "Z" if inc.last_activity else "",
            "affected_assets": inc.affected_assets or [],
            "ai_prediction": inc.ai_prediction,
            "mitre_technique_id": inc.mitre_technique_id,
            "mitre_technique": {
                "id": inc.mitre_technique.id,
                "name": inc.mitre_technique.name,
                "tactic": inc.mitre_technique.tactic
            } if inc.mitre_technique else None,
            "recommended_actions": inc.recommended_actions or [],
            "analyst_notes": inc.analyst_notes,
            "assigned_analyst": inc.assigned_analyst,
            "is_simulated": inc.is_simulated
        })

    # Merge in-memory simulation incidents
    for sim_inc in simulation_engine.generated_incidents:
        if sim_inc.get("incident_number") not in seen_numbers:
            seen_numbers.add(sim_inc.get("incident_number"))
            incident_list.insert(0, sim_inc)

    return incident_list

@router.get("/{incident_id}")
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves full incident case details including timeline events, linked evidence flows, and MITRE guidance.
    """
    stmt = (
        select(Incident)
        .options(joinedload(Incident.mitre_technique), selectinload(Incident.events))
        .where(
            (Incident.incident_number == incident_id) |
            (Incident.id == int(incident_id) if incident_id.isdigit() else False)
        )
    )
    result = await db.execute(stmt)
    inc = result.scalars().first()

    if inc:
        # Fetch correlated traffic events for evidence
        assets = inc.affected_assets or []
        correlated_events = []
        if assets:
            ev_stmt = (
                select(TrafficEvent)
                .where(
                    (TrafficEvent.source_ip.in_(assets)) |
                    (TrafficEvent.destination_ip.in_(assets))
                )
                .order_by(desc(TrafficEvent.timestamp))
                .limit(25)
            )
            ev_res = await db.execute(ev_stmt)
            correlated_events = [
                {
                    "timestamp": e.timestamp.isoformat() + "Z" if e.timestamp else "",
                    "source_ip": e.source_ip,
                    "destination_ip": e.destination_ip,
                    "protocol": e.protocol,
                    "source_port": e.source_port,
                    "destination_port": e.destination_port,
                    "packets": e.packets,
                    "bytes": e.bytes,
                    "tcp_flags": e.tcp_flags,
                    "status": e.status,
                    "risk_score": e.risk_score
                }
                for e in ev_res.scalars().all()
            ]

        # If no DB events found, fall back to simulation recent events
        if not correlated_events:
            correlated_events = [
                e for e in simulation_engine.latest_events
                if any(a in [e.get("source_ip"), e.get("destination_ip")] for a in assets)
            ][:15]

        # Format timeline
        events_timeline = [
            {
                "time": ev.event_time.strftime("%H:%M:%S UTC") if ev.event_time else "",
                "type": ev.event_type,
                "event": ev.description,
                "created_by": ev.created_by,
                "evidence": ev.evidence
            }
            for ev in sorted(inc.events, key=lambda x: x.event_time)
        ]

        return {
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "confidence": inc.confidence,
            "first_detected": inc.first_detected.isoformat() + "Z" if inc.first_detected else "",
            "last_activity": inc.last_activity.isoformat() + "Z" if inc.last_activity else "",
            "affected_assets": inc.affected_assets or [],
            "ai_prediction": inc.ai_prediction,
            "mitre_technique": {
                "id": inc.mitre_technique.id,
                "name": inc.mitre_technique.name,
                "tactic": inc.mitre_technique.tactic,
                "description": inc.mitre_technique.description,
                "detection_guidance": inc.mitre_technique.detection_guidance,
                "mitigation": inc.mitre_technique.mitigation,
                "url": inc.mitre_technique.url
            } if inc.mitre_technique else None,
            "recommended_actions": inc.recommended_actions or [],
            "analyst_notes": inc.analyst_notes,
            "assigned_analyst": inc.assigned_analyst,
            "is_simulated": inc.is_simulated,
            "timeline": events_timeline,
            "correlated_evidence": correlated_events
        }

    # Search in simulation engine cache
    for sim_inc in simulation_engine.generated_incidents:
        if sim_inc.get("incident_number") == incident_id or str(sim_inc.get("id")) == str(incident_id):
            return sim_inc

    raise HTTPException(status_code=404, detail="Incident not found")

@router.post("/{incident_id}/notes")
async def add_incident_note(incident_id: str, body: NoteRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.datetime.utcnow()
    time_str = now.strftime("%H:%M:%S UTC")
    author = body.author or "analyst@spectrum.internal"

    stmt = select(Incident).where(
        (Incident.incident_number == incident_id) |
        (Incident.id == int(incident_id) if incident_id.isdigit() else False)
    )
    result = await db.execute(stmt)
    inc = result.scalar_one_or_none()

    if inc:
        note_line = f"[{time_str}] {author}: {body.note}"
        inc.analyst_notes = (inc.analyst_notes or "") + f"\n{note_line}"
        inc.last_activity = now

        # Add IncidentEvent
        event = IncidentEvent(
            incident_id=inc.id,
            event_time=now,
            event_type="ANALYST_NOTE",
            description=f"Analyst note added: {body.note}",
            created_by=author
        )
        db.add(event)

        # Audit log
        audit = AuditLog(
            username=author,
            role="Analyst",
            action="ADD_INCIDENT_NOTE",
            resource_type="Incident",
            resource_id=inc.incident_number,
            details={"note": body.note}
        )
        db.add(audit)

        await db.commit()
        await db.refresh(inc)
        return {"status": "success", "incident_number": inc.incident_number, "note": note_line}

    # Simulation fallback
    for sim_inc in simulation_engine.generated_incidents:
        if sim_inc.get("incident_number") == incident_id or str(sim_inc.get("id")) == str(incident_id):
            note_line = f"[{time_str}] {author}: {body.note}"
            sim_inc["analyst_notes"] = (sim_inc.get("analyst_notes") or "") + f"\n{note_line}"
            if "timeline" not in sim_inc:
                sim_inc["timeline"] = []
            sim_inc["timeline"].append({"time": time_str, "event": f"Analyst Note: {body.note}"})
            return {"status": "success", "incident": sim_inc}

    raise HTTPException(status_code=404, detail="Incident not found")

@router.post("/{incident_id}/status")
async def update_incident_status(incident_id: str, body: StatusUpdateRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.datetime.utcnow()
    time_str = now.strftime("%H:%M:%S UTC")
    author = body.author or "analyst@spectrum.internal"

    stmt = select(Incident).where(
        (Incident.incident_number == incident_id) |
        (Incident.id == int(incident_id) if incident_id.isdigit() else False)
    )
    result = await db.execute(stmt)
    inc = result.scalar_one_or_none()

    if inc:
        old_status = inc.status
        inc.status = body.status
        inc.last_activity = now

        # Add IncidentEvent
        event = IncidentEvent(
            incident_id=inc.id,
            event_time=now,
            event_type="STATUS_CHANGE",
            description=f"Status changed from {old_status} to {body.status}",
            created_by=author
        )
        db.add(event)

        # Audit log
        audit = AuditLog(
            username=author,
            role="Analyst",
            action="UPDATE_INCIDENT_STATUS",
            resource_type="Incident",
            resource_id=inc.incident_number,
            details={"old_status": old_status, "new_status": body.status}
        )
        db.add(audit)

        await db.commit()
        await db.refresh(inc)
        return {"status": "success", "incident_number": inc.incident_number, "new_status": inc.status}

    # Simulation fallback
    for sim_inc in simulation_engine.generated_incidents:
        if sim_inc.get("incident_number") == incident_id or str(sim_inc.get("id")) == str(incident_id):
            sim_inc["status"] = body.status
            if "timeline" not in sim_inc:
                sim_inc["timeline"] = []
            sim_inc["timeline"].append({"time": time_str, "event": f"Status changed to {body.status}"})
            return {"status": "success", "incident": sim_inc}

    raise HTTPException(status_code=404, detail="Incident not found")
