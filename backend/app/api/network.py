from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_

from app.db.session import get_db
from app.db.models import Asset, TrafficEvent, Alert, Incident
from app.simulation.engine import simulation_engine, INTERNAL_ASSETS, EXTERNAL_IPS

router = APIRouter(prefix="/network", tags=["Network Explorer"])

@router.get("/topology")
async def get_network_topology(db: AsyncSession = Depends(get_db)):
    forecast = simulation_engine.latest_forecast
    risk = forecast.get("overall_risk_score", 10.0)
    under_attack = risk > 50

    # Query persistent assets from DB
    stmt = select(Asset)
    res = await db.execute(stmt)
    db_assets = res.scalars().all()

    # Pre-defined positions & categories for clean SOC network layout
    asset_id_map = {
        "10.0.1.1": "gw-1",
        "10.0.1.2": "sw-core",
        "10.0.1.15": "srv-web",
        "10.0.1.20": "srv-db",
        "10.0.1.5": "srv-dc",
        "10.0.2.45": "ws-1",
        "10.0.2.88": "ws-2",
        "198.51.100.44": "ext-att-1",
        "91.240.118.22": "ext-c2"
    }

    nodes = []
    if db_assets:
        for a in db_assets:
            node_id = asset_id_map.get(a.ip_address, f"asset-{a.id}")
            is_target = a.ip_address == "10.0.1.15" and under_attack
            nodes.append({
                "id": node_id,
                "label": a.hostname or a.ip_address,
                "ip": a.ip_address,
                "type": a.asset_type,
                "zone": "DMZ" if "1.1" in a.ip_address else "Production" if "10.0.1" in a.ip_address else "Corp LAN",
                "status": "under_attack" if is_target else a.status,
                "risk": risk if is_target else a.risk_score,
                "ports": a.open_ports or [80, 443],
                "traffic_mb": 1420 if "1.1" in a.ip_address else 940 if "1.15" in a.ip_address else 210
            })
    else:
        # Fallback nodes
        nodes = [
            {"id": "gw-1", "label": "Perimeter Gateway", "ip": "10.0.1.1", "type": "firewall", "zone": "DMZ", "status": "active", "risk": 15, "ports": [22, 443], "traffic_mb": 1420},
            {"id": "sw-core", "label": "Core Switch 10G", "ip": "10.0.1.2", "type": "switch", "zone": "Internal", "status": "active", "risk": 10, "ports": [161], "traffic_mb": 2200},
            {"id": "srv-web", "label": "web-prod-01", "ip": "10.0.1.15", "type": "server", "zone": "Production", "status": "under_attack" if under_attack else "healthy", "risk": risk if under_attack else 22, "ports": [80, 443, 8080], "traffic_mb": 940},
            {"id": "srv-db", "label": "db-cluster-primary", "ip": "10.0.1.20", "type": "database", "zone": "Database", "status": "healthy", "risk": 12, "ports": [3306, 5432], "traffic_mb": 310},
            {"id": "srv-dc", "label": "dc-auth-01", "ip": "10.0.1.5", "type": "domain_controller", "zone": "Identity", "status": "healthy", "risk": 28, "ports": [53, 88, 389, 445], "traffic_mb": 180},
            {"id": "ws-1", "label": "ws-analyst-08", "ip": "10.0.2.45", "type": "workstation", "zone": "Corp LAN", "status": "healthy", "risk": 14, "ports": [135, 445], "traffic_mb": 45},
            {"id": "ws-2", "label": "ws-finance-12", "ip": "10.0.2.88", "type": "workstation", "zone": "Corp LAN", "status": "healthy", "risk": 8, "ports": [445], "traffic_mb": 32},
        ]

    # External Threat nodes
    nodes.extend([
        {"id": "ext-att-1", "label": "External Threat Origin", "ip": "198.51.100.44", "type": "external_threat", "zone": "Internet", "status": "malicious" if under_attack else "inspected", "risk": 98 if under_attack else 45, "ports": [44321], "traffic_mb": 880},
        {"id": "ext-c2", "label": "External C2 Node", "ip": "91.240.118.22", "type": "external_threat", "zone": "Internet", "status": "malicious" if simulation_engine.active_scenario == "Botnet" else "inspected", "risk": 95 if simulation_engine.active_scenario == "Botnet" else 40, "ports": [8443], "traffic_mb": 110},
    ])

    edges = [
        {"from": "ext-att-1", "to": "gw-1", "protocol": "TCP", "status": "saturated" if under_attack else "inspected", "packets": 45000 if under_attack else 250},
        {"from": "ext-c2", "to": "gw-1", "protocol": "DNS", "status": "flagged" if simulation_engine.active_scenario == "Botnet" else "inspected", "packets": 1200},
        {"from": "gw-1", "to": "sw-core", "protocol": "Trunk", "status": "active", "packets": 98000},
        {"from": "sw-core", "to": "srv-web", "protocol": "HTTPS", "status": "saturated" if under_attack else "normal", "packets": 72000 if under_attack else 3400},
        {"from": "sw-core", "to": "srv-db", "protocol": "SQL", "status": "normal", "packets": 18000},
        {"from": "sw-core", "to": "srv-dc", "protocol": "Kerberos", "status": "normal", "packets": 9500},
        {"from": "sw-core", "to": "ws-1", "protocol": "SMB", "status": "normal", "packets": 4200},
        {"from": "sw-core", "to": "ws-2", "protocol": "SMB", "status": "normal", "packets": 3100},
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "active_devices_count": len(nodes),
        "threat_nodes_count": 2 if under_attack else 0,
        "mode": simulation_engine.mode,
        "is_simulated": simulation_engine.mode in ["simulation", "replay"]
    }

@router.get("/asset/{ip}")
async def get_asset_details(ip: str, db: AsyncSession = Depends(get_db)):
    # 1. Fetch asset from DB
    stmt = select(Asset).where(Asset.ip_address == ip)
    res = await db.execute(stmt)
    asset = res.scalar_one_or_none()

    # 2. Correlated Traffic Events
    ev_stmt = (
        select(TrafficEvent)
        .where(or_(TrafficEvent.source_ip == ip, TrafficEvent.destination_ip == ip))
        .order_by(desc(TrafficEvent.timestamp))
        .limit(10)
    )
    ev_res = await db.execute(ev_stmt)
    events = [
        {
            "timestamp": e.timestamp.isoformat() + "Z" if e.timestamp else "",
            "source_ip": e.source_ip,
            "destination_ip": e.destination_ip,
            "protocol": e.protocol,
            "packets": e.packets,
            "bytes": e.bytes,
            "tcp_flags": e.tcp_flags,
            "status": e.status,
            "risk_score": e.risk_score
        }
        for e in ev_res.scalars().all()
    ]

    if not events:
        events = [e for e in simulation_engine.latest_events if e.get("source_ip") == ip or e.get("destination_ip") == ip][:10]

    # 3. Linked Alerts
    al_stmt = (
        select(Alert)
        .where(or_(Alert.source_ip == ip, Alert.destination_ip == ip))
        .order_by(desc(Alert.timestamp))
        .limit(5)
    )
    al_res = await db.execute(al_stmt)
    linked_alerts = [
        {"alert_code": a.alert_code, "title": a.title, "severity": a.severity, "status": a.status}
        for a in al_res.scalars().all()
    ]

    if asset:
        return {
            "ip": asset.ip_address,
            "hostname": asset.hostname,
            "device_type": asset.asset_type.replace("_", " ").title(),
            "criticality": asset.criticality.capitalize(),
            "operating_system": asset.operating_system,
            "risk_score": asset.risk_score,
            "active_connections": len(events),
            "open_ports": asset.open_ports or [80, 443],
            "recent_events": events,
            "linked_alerts": linked_alerts,
            "vulnerabilities": asset.vulnerabilities or []
        }

    return {
        "ip": ip,
        "hostname": f"host-{ip.replace('.', '-')}.corp",
        "device_type": "Server" if "10.0.1" in ip else "Workstation" if "10.0.2" in ip else "External Node",
        "criticality": "Critical" if "10.0.1" in ip else "Low",
        "operating_system": "Ubuntu Linux 22.04 LTS",
        "risk_score": 88.0 if "198.51" in ip or "91.240" in ip else 24.0,
        "active_connections": len(events) or 5,
        "open_ports": [80, 443, 22, 8080],
        "recent_events": events,
        "linked_alerts": linked_alerts,
        "vulnerabilities": ["CVE-2023-4863", "CVE-2023-38545"]
    }
