from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/simulation", tags=["Simulation Mode"])

class ScenarioRequest(BaseModel):
    scenario: str  # 'Normal', 'Port Scan', 'Brute Force', 'DDoS', 'Botnet', 'Web Attack'
    speed: Optional[float] = 1.0

class ModeRequest(BaseModel):
    mode: str  # 'simulation', 'idle', 'replay', 'live'

@router.get("/status")
async def get_simulation_status():
    return {
        "is_running": simulation_engine.is_running,
        "mode": simulation_engine.mode,
        "active_scenario": simulation_engine.active_scenario,
        "speed": simulation_engine.speed,
        "step_count": simulation_engine.step_count,
        "live_stats": simulation_engine.live_stats,
        "forecast": simulation_engine.latest_forecast,
        "is_simulated": simulation_engine.mode in ["simulation", "replay"],
        "is_telemetry_active": simulation_engine.mode != "idle"
    }

@router.post("/mode")
async def set_telemetry_mode(body: ModeRequest):
    simulation_engine.set_mode(body.mode)
    simulation_engine.step()
    return {
        "status": "mode_updated",
        "mode": simulation_engine.mode,
        "is_telemetry_active": simulation_engine.mode != "idle"
    }

@router.post("/start")
async def start_simulation():
    simulation_engine.start()
    return {
        "status": "started",
        "mode": simulation_engine.mode,
        "active_scenario": simulation_engine.active_scenario
    }

@router.post("/stop")
async def stop_simulation():
    simulation_engine.stop()
    return {
        "status": "stopped",
        "mode": simulation_engine.mode,
        "active_scenario": simulation_engine.active_scenario
    }

@router.post("/step")
async def step_simulation():
    simulation_engine.step()
    return {
        "status": "stepped",
        "step": simulation_engine.step_count,
        "forecast": simulation_engine.latest_forecast
    }

@router.post("/scenario")
async def set_scenario(body: ScenarioRequest):
    simulation_engine.set_scenario(body.scenario)
    if body.speed:
        simulation_engine.speed = body.speed
    simulation_engine.step()  # Immediately process one tick with new scenario
    return {
        "status": "scenario_updated",
        "mode": simulation_engine.mode,
        "scenario": simulation_engine.active_scenario,
        "forecast": simulation_engine.latest_forecast
    }
