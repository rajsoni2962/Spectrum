import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/live", tags=["Live Monitor"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Hook simulation engine to broadcast through WebSocket manager
async def ws_listener(payload: dict):
    await manager.broadcast(payload)

simulation_engine.listeners.append(ws_listener)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial snapshot immediately
        await websocket.send_json({
            "type": "INITIAL_SNAPSHOT",
            "scenario": simulation_engine.active_scenario,
            "live_stats": simulation_engine.live_stats,
            "forecast": simulation_engine.latest_forecast,
            "explainability": simulation_engine.latest_explainability,
            "recent_events": simulation_engine.latest_events[:20]
        })
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/metrics")
async def get_live_metrics():
    return {
        "live_stats": simulation_engine.live_stats,
        "recent_events": simulation_engine.latest_events,
        "scenario": simulation_engine.active_scenario,
        "is_simulated": simulation_engine.active_scenario != "Normal"
    }
