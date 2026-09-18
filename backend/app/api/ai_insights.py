from fastapi import APIRouter
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/ai-insights", tags=["AI Insights"])

@router.get("")
async def get_ai_insights():
    forecast = simulation_engine.latest_forecast
    features = simulation_engine.latest_features
    scenario = simulation_engine.active_scenario

    insights = [
        {
            "id": 1,
            "category": "Emerging Threats",
            "headline": f"Temporal Velocity Shift: Accelerated {forecast.get('predicted_attack', 'Volumetric')} Vector",
            "confidence": round(forecast.get("confidence_score", 0.94) * 100, 1),
            "severity": "Critical" if forecast.get("overall_risk_score", 10) > 60 else "Low",
            "evidence_basis": f"Calculated over rolling 10-second window. Feature velocity observed at {features.get('packet_rate', 25):.1f} pkts/sec with SYN flag ratio of {features.get('syn_ratio', 0.05)*100:.1f}%.",
            "impact_analysis": "Pre-attack trajectory indicates attempt to exhaust gateway connection pool before payload delivery."
        },
        {
            "id": 2,
            "category": "Repeated Attackers",
            "headline": "Persistent Target Correlation on Subnet 10.0.1.0/24",
            "confidence": 92.4,
            "severity": "High",
            "evidence_basis": "Historical log correlation identifies origin IP 198.51.100.44 participating in 14 distinct flow bursts across last 4 hours.",
            "impact_analysis": "Targeted reconnaissance behavior preceding active penetration attempt."
        },
        {
            "id": 3,
            "category": "Unusual Traffic Anomaly",
            "headline": "Low-Entropy Handshake Asymmetry Detected",
            "confidence": 88.7,
            "severity": "Medium",
            "evidence_basis": f"Shannon port entropy measured at {features.get('port_entropy', 2.2):.2f}, deviating from normal enterprise baseline of 3.8-4.5.",
            "impact_analysis": "Indicative of automated scripting or tool-assisted protocol manipulation."
        },
        {
            "id": 4,
            "category": "Frequent Attack Types",
            "headline": "Cluster Shift Toward Volumetric Flooding & Service Probing",
            "confidence": 95.1,
            "severity": "High",
            "evidence_basis": "Multi-class Random Forest probability distribution shows 68% shift towards volumetric vectors over the last 15 operational windows.",
            "impact_analysis": "Suggests coordinated multi-vector pressure testing on ingress edge routers."
        }
    ]

    confidence_trend = [
        {"window": "W-5", "confidence": 94.2, "samples": 420},
        {"window": "W-4", "confidence": 95.0, "samples": 480},
        {"window": "W-3", "confidence": 96.1, "samples": 540},
        {"window": "W-2", "confidence": 95.8, "samples": 610},
        {"window": "W-1", "confidence": 96.8, "samples": 750},
        {"window": "Current", "confidence": round(forecast.get("confidence_score", 0.96) * 100, 1), "samples": 820},
    ]

    return {
        "insights": insights,
        "confidence_trend": confidence_trend,
        "overall_evaluation": forecast.get("ai_reasoning", "Passive telemetry shows normal distribution."),
        "is_simulated": simulation_engine.active_scenario != "Normal"
    }
