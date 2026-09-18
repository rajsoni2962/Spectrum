import os
import datetime
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.simulation.engine import simulation_engine
from app.services.report_generator import generate_pdf_report
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Reports & Export Center"])

STORED_REPORTS: List[Dict[str, Any]] = [
    {
        "report_id": "REP-2026-0917-001",
        "title": "Forensic Attack Forecast & Incident Triage Brief",
        "report_type": "incident",
        "generated_by": "analyst@spectrum.internal",
        "created_at": "2026-09-17 12:40:00 UTC",
        "incident_number": "INC-2026-0917-0042",
        "summary": "Full AI-powered attack forecast analysis detailing pre-attack SYN flood indicators targeting production web servers.",
        "has_pdf": True
    }
]

class ReportCreateRequest(BaseModel):
    title: Optional[str] = "SPECTRUM Threat Intelligence & Incident Report"
    incident_number: Optional[str] = "INC-2026-0917-0042"
    generated_by: Optional[str] = "analyst@spectrum.internal"
    summary: Optional[str] = None

@router.get("")
async def list_reports():
    return STORED_REPORTS

@router.post("/generate")
async def generate_report(body: ReportCreateRequest):
    forecast = simulation_engine.latest_forecast
    report_id = f"REP-2026-0917-{len(STORED_REPORTS) + 1:03d}"
    
    report_payload = {
        "report_id": report_id,
        "title": body.title,
        "incident_number": body.incident_number,
        "generated_by": body.generated_by,
        "summary": body.summary,
        "forecast": forecast
    }

    # Generate physical PDF using reportlab
    pdf_path = generate_pdf_report(report_payload)
    
    entry = {
        "report_id": report_id,
        "title": body.title,
        "report_type": "incident",
        "generated_by": body.generated_by,
        "created_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "incident_number": body.incident_number,
        "summary": body.summary or forecast.get("ai_reasoning"),
        "has_pdf": True,
        "file_path": pdf_path
    }
    STORED_REPORTS.insert(0, entry)
    return entry

@router.get("/download/{report_id}")
async def download_pdf_report(report_id: str):
    filename = f"{report_id}.pdf"
    filepath = os.path.join(settings.REPORTS_DIR, filename)

    if not os.path.exists(filepath):
        # Auto-generate if missing
        forecast = simulation_engine.latest_forecast
        filepath = generate_pdf_report({
            "report_id": report_id,
            "title": "SPECTRUM Forensic Attack Forecast Report",
            "incident_number": "INC-2026-0917-0042",
            "generated_by": "analyst@spectrum.internal",
            "forecast": forecast
        })

    return FileResponse(
        path=filepath,
        filename=f"SPECTRUM-{report_id}.pdf",
        media_type="application/pdf"
    )

@router.get("/export/csv")
async def export_events_csv():
    events = simulation_engine.latest_events
    lines = ["timestamp,source_ip,destination_ip,protocol,packets,bytes,risk_level,status,is_simulated\n"]
    for e in events:
        lines.append(f"{e.get('timestamp')},{e.get('source_ip')},{e.get('destination_ip')},{e.get('protocol')},{e.get('packets')},{e.get('bytes')},{e.get('risk_level')},{e.get('status')},{e.get('is_simulated')}\n")
    return Response(content="".join(lines), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=spectrum_traffic_export.csv"})
