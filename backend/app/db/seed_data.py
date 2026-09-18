import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import (
    User, Role, Asset, MitreTechnique, ThreatIndicator,
    ModelVersion, ModelMetrics, Alert, Incident, IncidentEvent
)
from app.core.security import get_password_hash
from app.ml.model_trainer import get_benchmark_metrics

async def seed_initial_data(db: AsyncSession):
    # 1. Check if already seeded
    res = await db.execute(select(User).limit(1))
    if res.scalars().first():
        return

    print("[DB Seeder] Initializing default SOC records...")

    # 2. Roles
    roles = [
        Role(name="admin", description="Full SOC Administrator access with system configuration control"),
        Role(name="manager", description="Security Operations Manager with reporting & oversight privileges"),
        Role(name="analyst", description="SOC Analyst with alert triage, investigation, and response privileges"),
        Role(name="viewer", description="Read-only SOC observer and dashboard viewer")
    ]
    db.add_all(roles)

    # 3. Users (password: "Spectrum@2026")
    default_pw = get_password_hash("Spectrum@2026")
    users = [
        User(username="admin", email="admin@spectrum.internal", full_name="SOC Lead Administrator", hashed_password=default_pw, role="admin"),
        User(username="analyst", email="analyst@spectrum.internal", full_name="Tier-2 SOC Analyst", hashed_password=default_pw, role="analyst"),
        User(username="manager", email="manager@spectrum.internal", full_name="SecOps Manager", hashed_password=default_pw, role="manager"),
        User(username="viewer", email="auditor@spectrum.internal", full_name="Compliance Auditor", hashed_password=default_pw, role="viewer"),
    ]
    db.add_all(users)

    # 4. MITRE ATT&CK Catalog
    mitres = [
        MitreTechnique(
            id="T1498",
            tactic="Impact",
            name="Network Denial of Service",
            description="Adversaries may perform Network Denial of Service (DoS) attacks to degrade or block the availability of targeted resources to users.",
            detection_guidance="Monitor network traffic for sudden spikes in volumetric packet arrival or high SYN/RST flag disparity.",
            mitigation="Implement ingress rate limiting, SYN proxy cookies, BGP Anycast routing and cloud scrubbing.",
            url="https://attack.mitre.org/techniques/T1498/"
        ),
        MitreTechnique(
            id="T1046",
            tactic="Discovery",
            name="Network Service Discovery",
            description="Adversaries may attempt to get a listing of services running on remote hosts to identify vulnerable applications and open ports.",
            detection_guidance="Inspect firewall logs for sequential or distributed SYN probe packets hitting multiple closed destination ports.",
            mitigation="Ensure strict perimeter firewall ingress ACLs and employ network segmentation.",
            url="https://attack.mitre.org/techniques/T1046/"
        ),
        MitreTechnique(
            id="T1110",
            tactic="Credential Access",
            name="Brute Force",
            description="Adversaries may use brute force techniques to attempt authentication by guessing passwords or usernames.",
            detection_guidance="Monitor authentication daemon logs (sshd, rdp, kerberos) for high-frequency failed connection bursts.",
            mitigation="Enforce exponential IP lockout delays, account lockouts, and multi-factor authentication.",
            url="https://attack.mitre.org/techniques/T1110/"
        ),
        MitreTechnique(
            id="T1071",
            tactic="Command and Control",
            name="Application Layer Protocol C2",
            description="Adversaries may communicate using application layer protocols to avoid detection by blending with normal network traffic.",
            detection_guidance="Analyze periodic beaconing intervals, irregular DNS query sizes, or anomalous HTTP user-agent strings.",
            mitigation="Inspect encrypted traffic using TLS decryption proxies and enforce DNS query reputation filtering.",
            url="https://attack.mitre.org/techniques/T1071/"
        ),
        MitreTechnique(
            id="T1190",
            tactic="Initial Access",
            name="Exploit Public-Facing Application",
            description="Adversaries may attempt to exploit vulnerabilities in Internet-facing programs like web servers or databases.",
            detection_guidance="Monitor web server logs for URI fuzzing, SQL injection meta-characters, and path traversal strings.",
            mitigation="Deploy a Web Application Firewall (WAF) and maintain automated patch management.",
            url="https://attack.mitre.org/techniques/T1190/"
        )
    ]
    db.add_all(mitres)

    # 5. Enterprise Assets
    assets = [
        Asset(
            ip_address="10.0.1.15",
            hostname="web-prod-01.corp",
            asset_type="web_server",
            criticality="critical",
            operating_system="Ubuntu Linux 22.04 LTS",
            mac_address="00:50:56:A1:B2:C3",
            open_ports=[80, 443, 8080],
            vulnerabilities=["CVE-2023-4863", "CVE-2023-38545"],
            risk_score=24.5,
            status="healthy"
        ),
        Asset(
            ip_address="10.0.1.20",
            hostname="db-cluster-primary.corp",
            asset_type="database",
            criticality="critical",
            operating_system="Debian GNU/Linux 12",
            mac_address="00:50:56:B2:C3:D4",
            open_ports=[3306, 5432, 22],
            vulnerabilities=[],
            risk_score=12.0,
            status="healthy"
        ),
        Asset(
            ip_address="10.0.1.5",
            hostname="dc-auth-01.corp",
            asset_type="domain_controller",
            criticality="critical",
            operating_system="Windows Server 2022",
            mac_address="00:50:56:C3:D4:E5",
            open_ports=[53, 88, 135, 389, 445],
            vulnerabilities=["CVE-2022-26925"],
            risk_score=35.0,
            status="healthy"
        ),
        Asset(
            ip_address="10.0.1.1",
            hostname="gw-perimeter-fw.corp",
            asset_type="firewall",
            criticality="critical",
            operating_system="Palo Alto PAN-OS 11.0",
            mac_address="00:50:56:D4:E5:F6",
            open_ports=[443, 22],
            vulnerabilities=[],
            risk_score=8.5,
            status="healthy"
        ),
        Asset(
            ip_address="10.0.2.45",
            hostname="ws-analyst-08.corp",
            asset_type="workstation",
            criticality="medium",
            operating_system="Windows 11 Pro",
            mac_address="00:50:56:E5:F6:A7",
            open_ports=[135, 445],
            vulnerabilities=[],
            risk_score=18.0,
            status="healthy"
        ),
    ]
    db.add_all(assets)

    # 6. Threat Indicators (IoCs)
    indicators = [
        ThreatIndicator(indicator_type="ip", value="198.51.100.44", threat_actor="APT-29 / Midnight Blizzard", reputation_score=95, source_feed="AlienVault OTX", description="Active SYN flood origin node"),
        ThreatIndicator(indicator_type="ip", value="185.220.101.5", threat_actor="Anonymous Sudan", reputation_score=92, source_feed="AbuseIPDB", description="Known Tor exit node used in brute force sweeps"),
        ThreatIndicator(indicator_type="ip", value="91.240.118.22", threat_actor="Cobalt Strike C2", reputation_score=98, source_feed="ThreatConnect", description="Command & Control beaconing listener"),
        ThreatIndicator(indicator_type="ip", value="45.33.32.156", threat_actor="Masscan Recon Fleet", reputation_score=86, source_feed="Shadowserver", description="High-frequency port scanner"),
        ThreatIndicator(indicator_type="domain", value="c2-sync-update.com", threat_actor="FIN7", reputation_score=99, source_feed="Mandiant", description="Malware secondary stage payload server")
    ]
    db.add_all(indicators)

    # 7. Model Version & Metrics
    bench = get_benchmark_metrics()
    mv = ModelVersion(
        name=bench["model_name"],
        version="2.4.0",
        architecture=bench["architecture"],
        is_active=True,
        accuracy=bench["accuracy"],
        precision_score=bench["precision"],
        recall_score=bench["recall"],
        f1_score=bench["f1_score"],
        roc_auc=bench["roc_auc"],
        false_positive_rate=bench["false_positive_rate"],
        detection_latency_ms=bench["detection_latency_ms"]
    )
    db.add(mv)
    await db.flush()

    for p in bench["per_class_metrics"]:
        mm = ModelMetrics(
            model_version_id=mv.id,
            attack_class=p["attack_class"],
            precision=p["precision"],
            recall=p["recall"],
            f1=p["f1"],
            support=p["support"],
            confusion_matrix=[]
        )
        db.add(mm)

    # 8. Seed Default Alert & Incident
    alert1 = Alert(
        alert_code="ALT-2026-0917-001",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=15),
        severity="High",
        status="Investigating",
        title="Predictive Alert: Emerging SYN Flood Velocity Disparity",
        category="Denial of Service",
        source_ip="198.51.100.44",
        destination_ip="10.0.1.15",
        mitre_technique_id="T1498",
        attack_probability=0.88,
        confidence=0.96,
        assigned_to="analyst@spectrum.internal",
        description="Forecasting model detected sudden 12x escalation in SYN packets with 94% destination concentration on web-prod-01.",
        analyst_notes="Rate limiting policy draft submitted to perimeter firewall."
    )
    db.add(alert1)

    inc1 = Incident(
        incident_number="INC-2026-0917-0042",
        title="High-Confidence Forecasted DDoS Escalation on Web Production Cluster",
        severity="Critical",
        status="Investigating",
        confidence=0.96,
        first_detected=datetime.datetime.utcnow() - datetime.timedelta(minutes=20),
        last_activity=datetime.datetime.utcnow() - datetime.timedelta(minutes=2),
        affected_assets=["10.0.1.15 (web-prod-01.corp)", "10.0.1.1 (gw-perimeter-fw.corp)"],
        ai_prediction="DDoS",
        mitre_technique_id="T1498",
        recommended_actions=[
            "Enable BGP Flowspec rate limiting on edge routers",
            "Engage Cloudflare Magic Transit scrubbing tunnel",
            "Activate SYN-proxy cookie protection on perimeter firewall"
        ],
        analyst_notes="Incident escalated automatically from SPECTRUM Forecasting model upon reaching 88% probability threshold.",
        assigned_analyst="analyst@spectrum.internal"
    )
    db.add(inc1)
    await db.flush()

    evt1 = IncidentEvent(
        incident_id=inc1.id,
        event_time=datetime.datetime.utcnow() - datetime.timedelta(minutes=20),
        event_type="forecast_alert",
        description="Temporal forecasting engine flagged 45s escalation horizon on destination 10.0.1.15.",
        evidence={"packet_rate": 1840, "syn_ratio": 0.89, "horizon_sec": 45}
    )
    evt2 = IncidentEvent(
        incident_id=inc1.id,
        event_time=datetime.datetime.utcnow() - datetime.timedelta(minutes=15),
        event_type="escalation",
        description="Risk score crossed 82% threshold - incident formally opened.",
        evidence={"overall_risk": 89.2}
    )
    db.add_all([evt1, evt2])

    await db.commit()
    print("[DB Seeder] Database populated successfully.")
