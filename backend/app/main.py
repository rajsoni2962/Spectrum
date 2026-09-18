import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import engine, Base, AsyncSessionLocal
from app.db.seed_data import seed_initial_data
from app.simulation.engine import simulation_engine

# Routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.live import router as live_router
from app.api.forecast import router as forecast_router
from app.api.alerts import router as alerts_router
from app.api.incidents import router as incidents_router
from app.api.network import router as network_router
from app.api.traffic import router as traffic_router
from app.api.investigation import router as investigation_router
from app.api.threat_intel import router as threat_intel_router
from app.api.ai_insights import router as ai_insights_router
from app.api.models import router as models_router
from app.api.explainability import router as explainability_router
from app.api.reports import router as reports_router
from app.api.simulation import router as simulation_router
from app.api.system import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default data
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

    # Start simulation engine background runner
    simulation_engine.start()

    yield

    # Clean shutdown
    simulation_engine.stop()
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_TITLE,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
v1 = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=v1)
app.include_router(dashboard_router, prefix=v1)
app.include_router(live_router, prefix=v1)
app.include_router(forecast_router, prefix=v1)
app.include_router(alerts_router, prefix=v1)
app.include_router(incidents_router, prefix=v1)
app.include_router(network_router, prefix=v1)
app.include_router(traffic_router, prefix=v1)
app.include_router(investigation_router, prefix=v1)
app.include_router(threat_intel_router, prefix=v1)
app.include_router(ai_insights_router, prefix=v1)
app.include_router(models_router, prefix=v1)
app.include_router(explainability_router, prefix=v1)
app.include_router(reports_router, prefix=v1)
app.include_router(simulation_router, prefix=v1)
app.include_router(system_router, prefix=v1)

import os
from fastapi.responses import FileResponse

dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")

if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "platform": "SPECTRUM",
            "description": "AI Network Security & Attack Forecasting Platform",
            "version": settings.VERSION,
            "status": "operational",
            "api_docs": "/api/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

