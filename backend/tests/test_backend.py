import pytest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.feature_extractor import extract_features_from_events
from app.ml.attack_classifier import classifier
from app.ml.forecaster import forecaster
from app.ml.explainer import explainer
from app.simulation.engine import simulation_engine
from app.services.report_generator import generate_pdf_report

def test_feature_extractor():
    sample_events = [
        {"source_ip": "198.51.100.44", "destination_ip": "10.0.1.15", "destination_port": 443, "protocol": "TCP", "packets": 5, "bytes": 450, "tcp_flags": "SYN"},
        {"source_ip": "198.51.100.44", "destination_ip": "10.0.1.15", "destination_port": 443, "protocol": "TCP", "packets": 10, "bytes": 900, "tcp_flags": "SYN"},
    ]
    features = extract_features_from_events(sample_events, window_seconds=1.0)
    assert "packet_rate" in features
    assert features["packet_rate"] == 15.0
    assert features["syn_ratio"] == 1.0

def test_attack_classifier():
    features = {
        "packet_rate": 1500.0,
        "byte_rate": 1200000.0,
        "active_connections": 350,
        "failed_connections": 45,
        "syn_ratio": 0.92,
        "rst_ratio": 0.35,
        "port_entropy": 0.8,
        "destination_concentration": 0.95,
        "mean_packet_size": 90.0
    }
    pred, conf, probs = classifier.predict(features)
    assert pred in classifier.classes
    assert conf > 0.0
    assert len(probs) == len(classifier.classes)

def test_forecaster():
    features = {
        "packet_rate": 1200.0,
        "byte_rate": 850000.0,
        "active_connections": 280,
        "failed_connections": 30,
        "syn_ratio": 0.88,
        "rst_ratio": 0.25,
        "port_entropy": 1.1,
        "destination_concentration": 0.92,
        "mean_packet_size": 85.0
    }
    forecast = forecaster.forecast(features)
    assert "overall_risk_score" in forecast
    assert "forecast_horizon_seconds" in forecast
    assert "predicted_attack" in forecast
    assert "ai_reasoning" in forecast
    assert "contributing_features" in forecast

def test_explainer():
    features = {
        "packet_rate": 1500.0,
        "byte_rate": 900000.0,
        "active_connections": 300,
        "failed_connections": 20,
        "syn_ratio": 0.9,
        "rst_ratio": 0.2,
        "destination_concentration": 0.9,
        "port_entropy": 1.2
    }
    explanation = explainer.explain(features, "DDoS", 0.96)
    assert "waterfall" in explanation
    assert len(explanation["waterfall"]) > 0
    assert "plain_language_explanation" in explanation

def test_simulation_engine_step():
    simulation_engine.set_scenario("DDoS")
    simulation_engine.step()
    assert len(simulation_engine.latest_events) > 0
    assert simulation_engine.latest_forecast["current_threat_state"] in ["Under Attack", "Critical", "Elevated"]

def test_pdf_report_generation():
    forecast = simulation_engine.latest_forecast
    report_data = {
        "report_id": "REP-TEST-001",
        "title": "Automated Test Report",
        "incident_number": "INC-2026-0917-0042",
        "generated_by": "pytest@spectrum.internal",
        "forecast": forecast
    }
    pdf_path = generate_pdf_report(report_data)
    assert os.path.exists(pdf_path)
    assert os.path.getsize(pdf_path) > 1000

def test_anomaly_detector_analysis():
    from app.ml.anomaly_detector import anomaly_detector
    features = {
        "packet_rate": 45000.0,
        "byte_rate": 8000000.0,
        "active_connections": 850,
        "failed_connections": 80,
        "syn_ratio": 0.95,
        "rst_ratio": 0.40,
        "port_entropy": 0.3,
        "destination_concentration": 0.98,
        "mean_packet_size": 95.0
    }
    analysis = anomaly_detector.analyze(features)
    assert "anomaly_score" in analysis
    assert analysis["anomaly_score"] > 0.4
    assert analysis["is_anomalous"] is True
    assert len(analysis["deviant_signals"]) > 0

def test_simulation_engine_modes():
    # Idle mode
    simulation_engine.set_mode("idle")
    simulation_engine.step()
    assert simulation_engine.mode == "idle"
    assert len(simulation_engine.latest_events) == 0
    assert simulation_engine.live_stats["packets_per_sec"] == 0
    assert simulation_engine.latest_forecast["is_telemetry_active"] is False

    # Simulation mode
    simulation_engine.set_mode("simulation")
    simulation_engine.set_scenario("DDoS")
    simulation_engine.step()
    assert simulation_engine.mode == "simulation"
    assert len(simulation_engine.latest_events) > 0
    assert simulation_engine.live_stats["packets_per_sec"] > 0

def test_forecaster_modular_structure():
    features = {
        "packet_rate": 2500.0,
        "byte_rate": 2000000.0,
        "active_connections": 400,
        "failed_connections": 50,
        "syn_ratio": 0.92,
        "rst_ratio": 0.30,
        "port_entropy": 0.9,
        "destination_concentration": 0.95,
        "mean_packet_size": 90.0
    }
    forecast = forecaster.forecast(features)
    assert "now" in forecast
    assert "anomaly_score" in forecast["now"]
    assert "trajectory" in forecast
    assert "velocity_packet_rate" in forecast["trajectory"]
    assert "projected_curve" in forecast["trajectory"]
    assert len(forecast["trajectory"]["projected_curve"]) == 5
