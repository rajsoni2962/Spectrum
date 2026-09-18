from fastapi import APIRouter
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary():
    forecast = simulation_engine.latest_forecast
    live_stats = simulation_engine.live_stats
    risk = forecast.get("overall_risk_score", 8.5)
    threat_state = forecast.get("current_threat_state", "Normal")

    # Network health percentage inversely proportional to risk
    network_health = round(max(100.0 - (risk * 0.85), 15.0), 1)

    # Historical timeline data points (last 15 intervals)
    timeline = [
        {"time": f"T-{14-i*2}m", "risk_score": max(round(risk * (0.3 + 0.05*i), 1), 5.0), "anomaly_score": round(max(risk/120.0, 0.05), 2)}
        for i in range(7)
    ]
    timeline.append({"time": "Now", "risk_score": risk, "anomaly_score": round(live_stats.get("anomaly_score", 0.08), 2)})

    # Traffic volume graph (packets/sec and KB/s)
    pkts = live_stats.get("packets_per_sec", 120)
    traffic_volume = [
        {"time": "12:00", "packets": max(int(pkts * 0.8), 20), "bandwidth_kb": max(int(pkts * 0.9), 15)},
        {"time": "12:10", "packets": max(int(pkts * 0.85), 25), "bandwidth_kb": max(int(pkts * 0.95), 18)},
        {"time": "12:20", "packets": max(int(pkts * 0.9), 30), "bandwidth_kb": max(int(pkts * 1.0), 22)},
        {"time": "12:30", "packets": max(int(pkts * 0.95), 35), "bandwidth_kb": max(int(pkts * 1.05), 28)},
        {"time": "12:40", "packets": pkts, "bandwidth_kb": int(live_stats.get("bytes_per_sec", 45000) / 1024)},
    ]

    # Attack distribution
    attack_dist = [
        {"name": "DDoS", "value": 35, "color": "#FF2E63"},
        {"name": "Port Scan", "value": 25, "color": "#FF4D5E"},
        {"name": "Brute Force", "value": 18, "color": "#FFB547"},
        {"name": "Botnet", "value": 12, "color": "#4F8CFF"},
        {"name": "Web Attack", "value": 10, "color": "#A78BFA"},
    ]

    # Top IPs
    top_sources = [
        {"ip": "198.51.100.44", "country": "RU", "traffic_mb": 420.5, "packets": 124000, "risk": "Critical"},
        {"ip": "185.220.101.5", "country": "DE", "traffic_mb": 180.2, "packets": 45000, "risk": "High"},
        {"ip": "45.33.32.156", "country": "US", "traffic_mb": 95.8, "packets": 28000, "risk": "Medium"},
        {"ip": "91.240.118.22", "country": "NL", "traffic_mb": 78.4, "packets": 19500, "risk": "High"},
        {"ip": "10.0.2.45", "country": "Internal", "traffic_mb": 34.1, "packets": 8200, "risk": "Low"}
    ]

    top_destinations = [
        {"ip": "10.0.1.15", "hostname": "web-prod-01.corp", "role": "Web Server", "traffic_mb": 512.4, "status": "Under Attack" if risk > 50 else "Healthy"},
        {"ip": "10.0.1.20", "hostname": "db-cluster-primary.corp", "role": "Database", "traffic_mb": 185.0, "status": "Healthy"},
        {"ip": "10.0.1.5", "hostname": "dc-auth-01.corp", "role": "Domain Controller", "traffic_mb": 142.1, "status": "Healthy"},
        {"ip": "10.0.1.1", "hostname": "gw-perimeter-fw.corp", "role": "Edge Gateway", "traffic_mb": 840.6, "status": "Healthy"},
    ]

    protocol_distribution = [
        {"protocol": "TCP", "percentage": 78.4, "color": "#4F8CFF"},
        {"protocol": "UDP", "percentage": 14.2, "color": "#36D399"},
        {"protocol": "HTTP/S", "percentage": 5.8, "color": "#FFB547"},
        {"protocol": "DNS/ICMP", "percentage": 1.6, "color": "#94A3B8"}
    ]

    return {
        "kpis": {
            "network_health_percent": network_health,
            "current_threat_level": threat_state,
            "overall_attack_risk": risk,
            "active_incidents": len(simulation_engine.generated_incidents) or 1,
            "events_per_minute": pkts * 60,
            "model_confidence": round(forecast.get("confidence_score", 0.94) * 100, 1),
            "forecast_horizon_seconds": forecast.get("forecast_horizon_seconds", 45),
            "predicted_attack": forecast.get("predicted_attack", "Normal"),
            "is_simulated": simulation_engine.active_scenario != "Normal"
        },
        "attack_risk_timeline": timeline,
        "traffic_volume": traffic_volume,
        "attack_distribution": attack_dist,
        "top_source_ips": top_sources,
        "top_destination_ips": top_destinations,
        "protocol_distribution": protocol_distribution,
        "live_threat_feed": simulation_engine.latest_events[:8]
    }
