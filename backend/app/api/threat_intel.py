from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

INDICATORS = [
    {"type": "IP", "value": "198.51.100.44", "threat_actor": "APT-29 / Midnight Blizzard", "reputation_score": 95, "confidence": "High", "malware": "Cobalt Strike / Volumetric Flood", "feed": "AlienVault OTX", "last_seen": "2026-09-17 12:40 UTC"},
    {"type": "IP", "value": "185.220.101.5", "threat_actor": "Anonymous Sudan", "reputation_score": 92, "confidence": "High", "malware": "Tor Relay / SSH Dictionary Suite", "feed": "AbuseIPDB", "last_seen": "2026-09-17 12:38 UTC"},
    {"type": "IP", "value": "91.240.118.22", "threat_actor": "FIN7 / Carbanak", "reputation_score": 98, "confidence": "High", "malware": "DNS Beacon C2", "feed": "ThreatConnect", "last_seen": "2026-09-17 12:25 UTC"},
    {"type": "IP", "value": "45.33.32.156", "threat_actor": "Masscan Recon Fleet", "reputation_score": 86, "confidence": "Medium", "malware": "SYN Prober", "feed": "Shadowserver", "last_seen": "2026-09-17 12:12 UTC"},
    {"type": "Domain", "value": "c2-sync-update.com", "threat_actor": "Lazarus Group", "reputation_score": 99, "confidence": "High", "malware": "FastFlux C2", "feed": "Mandiant", "last_seen": "2026-09-17 11:50 UTC"},
    {"type": "Subnet", "value": "194.26.29.0/24", "threat_actor": "Bulletproof Hosting AS51852", "reputation_score": 90, "confidence": "High", "malware": "Web Exploit Scanners", "feed": "Spamhaus", "last_seen": "2026-09-17 10:15 UTC"},
]

@router.get("/indicators")
async def list_indicators(search: Optional[str] = None):
    if search:
        s = search.lower()
        return [i for i in INDICATORS if s in i["value"].lower() or s in i["threat_actor"].lower() or s in i["malware"].lower()]
    return INDICATORS
