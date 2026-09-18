from fastapi import APIRouter
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/forecast", tags=["Attack Forecast"])

@router.get("/current")
async def get_current_forecast():
    forecast = simulation_engine.latest_forecast
    features = simulation_engine.latest_features
    explainability = simulation_engine.latest_explainability

    # Radar/Bar contributing features
    feature_radar = [
        {"subject": "Traffic Volume", "value": min(int(features.get("packet_rate", 20) / 10.0), 100), "baseline": 20},
        {"subject": "Connection Rate", "value": min(int(features.get("active_connections", 15) * 2.5), 100), "baseline": 25},
        {"subject": "Failed Connections", "value": min(int(features.get("failed_connections", 0) * 8.0), 100), "baseline": 5},
        {"subject": "Destination Conc.", "value": int(features.get("destination_concentration", 0.15) * 100), "baseline": 20},
        {"subject": "Port Entropy", "value": int(min(features.get("port_entropy", 2.2) * 16.0, 100)), "baseline": 30},
        {"subject": "Protocol Disparity", "value": int(min(features.get("syn_ratio", 0.05) * 100, 100)), "baseline": 10},
    ]

    # Forecast horizon intervals
    horizon_timeline = [
        {"offset": "+15s", "predicted_risk": min(forecast.get("overall_risk_score", 10) * 1.05, 99.0)},
        {"offset": "+30s", "predicted_risk": min(forecast.get("overall_risk_score", 10) * 1.12, 99.5)},
        {"offset": "+45s", "predicted_risk": min(forecast.get("overall_risk_score", 10) * 1.18, 99.8)},
        {"offset": "+60s", "predicted_risk": min(forecast.get("overall_risk_score", 10) * 1.20, 99.9)},
        {"offset": "+120s", "predicted_risk": min(forecast.get("overall_risk_score", 10) * 1.22, 100.0)},
    ]

    return {
        "attack_risk_percentage": forecast.get("overall_risk_score", 8.2),
        "current_threat_state": forecast.get("current_threat_state", "Normal"),
        "predicted_attack": forecast.get("predicted_attack", "Normal"),
        "forecast_horizon_seconds": forecast.get("forecast_horizon_seconds", 45),
        "confidence_score": round(forecast.get("confidence_score", 0.94) * 100, 1),
        "historical_trend": forecast.get("historical_trend", "stable"),
        "current_traffic_state": {
            "packet_rate": features.get("packet_rate", 25.0),
            "byte_rate": features.get("byte_rate", 15000),
            "active_connections": features.get("active_connections", 20),
            "syn_ratio": round(features.get("syn_ratio", 0.05) * 100, 1),
            "rst_ratio": round(features.get("rst_ratio", 0.01) * 100, 1),
            "port_entropy": features.get("port_entropy", 2.2),
            "destination_concentration": round(features.get("destination_concentration", 0.15) * 100, 1)
        },
        "contributing_features": forecast.get("contributing_features", []),
        "feature_radar": feature_radar,
        "horizon_timeline": horizon_timeline,
        "all_class_probabilities": forecast.get("all_class_probabilities", {}),
        "ai_reasoning": forecast.get("ai_reasoning", "Network operating within baseline parameters."),
        "recommended_action": forecast.get("recommended_action", "Maintain passive SOC telemetry monitoring."),
        "is_simulated": simulation_engine.active_scenario != "Normal"
    }
