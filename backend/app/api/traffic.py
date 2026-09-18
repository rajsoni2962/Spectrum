from fastapi import APIRouter, UploadFile, File, Query
from typing import Optional
from app.simulation.engine import simulation_engine
from app.services.pcap_processor import validate_and_save_upload, parse_ingested_file

router = APIRouter(prefix="/traffic", tags=["Traffic Analysis"])

@router.get("/events")
async def list_traffic_events(
    limit: int = Query(50, ge=1, le=500),
    protocol: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None
):
    events = list(simulation_engine.latest_events)
    if protocol:
        events = [e for e in events if e.get("protocol", "").upper() == protocol.upper()]
    if risk:
        events = [e for e in events if e.get("risk_level", "").lower() == risk.lower()]
    if search:
        s = search.lower()
        events = [e for e in events if s in e.get("source_ip", "").lower() or s in e.get("destination_ip", "").lower()]
    return events[:limit]

@router.post("/upload")
async def upload_traffic_file(file: UploadFile = File(...)):
    saved_path = await validate_and_save_upload(file)
    result = parse_ingested_file(saved_path)
    return {
        "status": "success",
        "filename": file.filename,
        "records_parsed": result["records_parsed"],
        "sample_events": result["sample_events"]
    }

@router.get("/features")
async def get_traffic_features():
    return {
        "features": simulation_engine.latest_features,
        "is_simulated": simulation_engine.active_scenario != "Normal"
    }
