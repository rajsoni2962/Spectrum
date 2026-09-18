from fastapi import APIRouter
from app.simulation.engine import simulation_engine
from app.ml.explainer import explainer

router = APIRouter(prefix="/explainability", tags=["Explainability"])

@router.get("/current")
async def get_current_explanation():
    forecast = simulation_engine.latest_forecast
    features = simulation_engine.latest_features
    predicted = forecast.get("predicted_attack", "Normal")
    conf = forecast.get("confidence_score", 0.94)

    explanation = explainer.explain(features, predicted, conf)
    
    # Feature importance ranking for beeswarm / horizontal bar
    global_importance = [
        {"feature": "Abnormal Packet Escalation Rate", "importance": 0.28, "category": "Volumetric"},
        {"feature": "SYN/RST Flag Disparity", "importance": 0.24, "category": "Protocol"},
        {"feature": "Destination IP Concentration", "importance": 0.19, "category": "Routing"},
        {"feature": "Port Shannon Entropy", "importance": 0.14, "category": "Behavioral"},
        {"feature": "Failed Handshake Frequency", "importance": 0.10, "category": "Connection"},
        {"feature": "Mean Packet Size Deviation", "importance": 0.05, "category": "Payload"}
    ]

    return {
        "prediction": predicted,
        "confidence": conf,
        "base_value": explanation["base_value"],
        "predicted_risk_value": explanation["predicted_risk_value"],
        "waterfall": explanation["waterfall"],
        "global_importance": global_importance,
        "plain_language_explanation": explanation["plain_language_explanation"],
        "is_simulated": simulation_engine.active_scenario != "Normal"
    }
