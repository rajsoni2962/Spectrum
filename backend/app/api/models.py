from fastapi import APIRouter
from app.ml.model_trainer import get_benchmark_metrics

router = APIRouter(prefix="/models", tags=["Model Performance"])

@router.get("/metrics")
async def get_model_metrics():
    return get_benchmark_metrics()
