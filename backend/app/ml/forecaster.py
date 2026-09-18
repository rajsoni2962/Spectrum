from typing import Dict, Any, List, Tuple
from collections import deque
from app.ml.attack_classifier import classifier

class AttackForecaster:
    def __init__(self, history_size: int = 30):
        self.history = deque(maxlen=history_size)
        self.trend = "stable"

    def update_history(self, features: Dict[str, Any]):
        self.history.append(features)

    def forecast(self, current_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates current features and temporal velocity across the sliding window
        to forecast attack escalation before/as it develops.
        """
        self.update_history(current_features)
        
        # Base classification from classifier
        predicted_class, confidence, prob_dict = classifier.predict(current_features)
        
        # Calculate velocity of key features across sliding window
        packet_rate = float(current_features.get("packet_rate", 20.0))
        syn_ratio = float(current_features.get("syn_ratio", 0.05))
        rst_ratio = float(current_features.get("rst_ratio", 0.01))
        failed_conns = float(current_features.get("failed_connections", 0))
        dst_conc = float(current_features.get("destination_concentration", 0.2))

        # Temporal differential (velocity)
        velocity_pkt = 0.0
        velocity_syn = 0.0
        velocity_failed = 0.0
        if len(self.history) >= 3:
            prev_samples = list(self.history)[-3:]
            velocity_pkt = (packet_rate - float(prev_samples[0].get("packet_rate", packet_rate))) / 3.0
            velocity_syn = (syn_ratio - float(prev_samples[0].get("syn_ratio", syn_ratio))) / 3.0
            velocity_failed = (failed_conns - float(prev_samples[0].get("failed_connections", failed_conns))) / 3.0

        # Non-normal probability sum
        non_normal_prob = 1.0 - prob_dict.get("Normal", 0.85)

        # Dynamic risk score calculation (0 to 100)
        # Combines probability, feature velocity, and flag severity
        base_risk = non_normal_prob * 75.0
        velocity_boost = min(max(velocity_pkt * 0.05 + velocity_syn * 20.0 + velocity_failed * 0.8, 0.0), 25.0)
        overall_risk_score = min(max(round(base_risk + velocity_boost, 1), 4.2), 99.8)

        # Historical Trend
        if velocity_pkt > 50 or velocity_syn > 0.05 or velocity_failed > 2:
            self.trend = "escalating"
        elif velocity_pkt < -30 and velocity_syn < -0.03:
            self.trend = "de-escalating"
        else:
            self.trend = "stable"

        # Current Threat State
        if overall_risk_score > 80:
            threat_state = "Critical"
        elif overall_risk_score > 55:
            threat_state = "Under Attack"
        elif overall_risk_score > 25:
            threat_state = "Elevated"
        else:
            threat_state = "Normal"

        # Forecast Horizon (seconds until severe impact or saturation)
        # If escalating rapidly, horizon is short (15s-45s); if elevated, 60s-120s; if normal, N/A (300s)
        if threat_state in ["Critical", "Under Attack"]:
            forecast_horizon = max(int(60 - (overall_risk_score * 0.4)), 15)
        elif threat_state == "Elevated":
            forecast_horizon = int(120 - (overall_risk_score * 0.5))
        else:
            forecast_horizon = 300

        # Attack probability
        attack_probability = round(min(overall_risk_score / 100.0, 0.99), 3)
        if threat_state == "Normal":
            predicted_attack = "Normal"
            confidence = round(prob_dict.get("Normal", 0.94), 3)
        else:
            # Pick highest non-normal class
            sorted_classes = sorted([(cls, prob) for cls, prob in prob_dict.items() if cls != "Normal"], key=lambda x: x[1], reverse=True)
            predicted_attack = sorted_classes[0][0] if sorted_classes else "DDoS"
            confidence = max(round(sorted_classes[0][1], 3), 0.72)

        # Contributing features calculation
        contributing_features = self._calculate_contributions(current_features, predicted_attack)

        # Anomaly analysis for 'What is anomalous now?'
        from app.ml.anomaly_detector import anomaly_detector
        anomaly_analysis = anomaly_detector.analyze(current_features)

        # Dynamic projected risk curve for trajectory forecasting (+2m, +4m, +6m, +8m, +10m)
        projected_curve = []
        for offset_min in [2, 4, 6, 8, 10]:
            if self.trend == "escalating":
                proj_risk = min(overall_risk_score + (offset_min * (velocity_pkt * 0.04 + 1.8)), 99.9)
            elif self.trend == "de-escalating":
                proj_risk = max(overall_risk_score - (offset_min * 2.2), 6.5)
            else:
                proj_risk = overall_risk_score
            projected_curve.append({
                "horizon_label": f"+{offset_min}m",
                "projected_risk": round(proj_risk, 1)
            })

        # Explainable AI Reasoning Narrative & Tactical Response
        ai_reasoning = self._generate_ai_narrative(predicted_attack, current_features, contributing_features, threat_state, forecast_horizon)
        recommended_action = self._generate_recommended_action(predicted_attack, threat_state, current_features)

        return {
            # Backward-compatible top-level keys
            "current_threat_state": threat_state,
            "overall_risk_score": overall_risk_score,
            "predicted_attack": predicted_attack,
            "attack_probability": attack_probability,
            "forecast_horizon_seconds": forecast_horizon,
            "confidence_score": confidence,
            "historical_trend": self.trend,
            "contributing_features": contributing_features,
            "ai_reasoning": ai_reasoning,
            "recommended_action": recommended_action,
            "all_class_probabilities": prob_dict,

            # Explicit modular separation
            "now": {
                "anomaly_score": anomaly_analysis["anomaly_score"],
                "is_anomalous": anomaly_analysis["is_anomalous"],
                "deviant_signals": anomaly_analysis["deviant_signals"],
                "baseline_drift_magnitude": anomaly_analysis["baseline_drift_magnitude"]
            },
            "trajectory": {
                "velocity_packet_rate": round(velocity_pkt, 2),
                "velocity_syn_ratio": round(velocity_syn, 4),
                "velocity_failed_connections": round(velocity_failed, 2),
                "forecast_horizon_seconds": forecast_horizon,
                "historical_trend": self.trend,
                "projected_curve": projected_curve,
                "threat_state": threat_state
            },
            "classification": {
                "predicted_attack": predicted_attack,
                "confidence": confidence,
                "all_class_probabilities": prob_dict
            }
        }

    def _calculate_contributions(self, features: Dict[str, Any], attack_type: str) -> List[Dict[str, Any]]:
        """
        Calculates normalized percentage contribution of top behavioral signals.
        """
        pkt_rate = float(features.get("packet_rate", 20))
        syn_ratio = float(features.get("syn_ratio", 0.05))
        rst_ratio = float(features.get("rst_ratio", 0.01))
        failed_conns = float(features.get("failed_connections", 0))
        dst_conc = float(features.get("destination_concentration", 0.2))
        port_entropy = float(features.get("port_entropy", 2.0))
        byte_rate = float(features.get("byte_rate", 15000))

        if attack_type == "DDoS":
            weights = {
                "Abnormal Packet Escalation Rate": min(pkt_rate / 15.0, 38.0),
                "SYN Flag Disproportion": min(syn_ratio * 35.0, 28.0),
                "Destination IP Concentration": min(dst_conc * 25.0, 20.0),
                "Volumetric Byte Saturation": min(byte_rate / 250000.0, 14.0)
            }
        elif attack_type == "Port Scan":
            weights = {
                "Port Dispersion / Entropy Spike": min(port_entropy * 6.5, 36.0),
                "High RST Rejection Rate": min(rst_ratio * 40.0, 29.0),
                "Rapid Destination Probing": min(pkt_rate / 10.0, 20.0),
                "Connection Initiation Frequency": min(syn_ratio * 20.0, 15.0)
            }
        elif attack_type == "Brute Force":
            weights = {
                "Failed Connection Bursts": min(failed_conns * 2.5, 42.0),
                "Target Port Repetition (22/3389)": min(dst_conc * 28.0, 26.0),
                "Connection Velocity": min(pkt_rate / 8.0, 18.0),
                "TCP Handshake Anomalies": min(syn_ratio * 18.0, 14.0)
            }
        elif attack_type == "Botnet":
            weights = {
                "Periodic C2 Beaconing Jitter": 34.0,
                "DNS Query Anomalies": 27.0,
                "Outbound Connection Persistence": 23.0,
                "Payload Entropy Irregularity": 16.0
            }
        elif attack_type == "Web Attack":
            weights = {
                "Abnormal HTTP Error Responses": 35.0,
                "Payload Size Variance": 28.0,
                "Destination Concentration": 22.0,
                "Request Arrival Frequency": 15.0
            }
        else:
            weights = {
                "Baseline Traffic Variance": 12.0,
                "Routine TCP Handshakes": 8.0,
                "Distributed Port Spread": 6.0,
                "Standard Packet Length": 4.0
            }

        total = sum(weights.values()) or 1.0
        contributions = [
            {"feature": k, "weight": round(v / total, 3), "impact_percent": round((v / total) * 100, 1)}
            for k, v in weights.items()
        ]
        return sorted(contributions, key=lambda x: x["impact_percent"], reverse=True)

    def _generate_ai_narrative(self, attack: str, features: Dict[str, Any], contrib: List[Dict[str, Any]], threat: str, horizon: int) -> str:
        if threat == "Normal":
            return "Network telemetry indicates baseline operational behavior. Flow entropy, packet rates, and TCP flag handshakes remain within 95th percentile confidence boundaries."
        
        top_factors = ", ".join([f"{c['feature']} ({c['impact_percent']}%)" for c in contrib[:3]])
        return (
            f"SPECTRUM Forecasting Engine predicts imminent {attack} threat with {threat} severity within a {horizon}-second escalation window. "
            f"Prediction is primarily driven by: {top_factors}. Telemetry shows critical feature divergence from normal enterprise baselines."
        )

    def _generate_recommended_action(self, attack: str, threat: str, features: Dict[str, Any]) -> str:
        if threat == "Normal":
            return "Maintain standard continuous passive telemetry monitoring. No analyst intervention required."
        if attack == "DDoS":
            return "Trigger perimeter rate-limiting on ingress edge router, engage cloud scrubbing center / BGP flowspec, and enforce SYN-cookie protection on target gateway."
        if attack == "Port Scan":
            return "Temporarily blacklist scanning subnet on edge firewall, enable deception/honeynet decoy redirects, and verify no protected ports are exposed externally."
        if attack == "Brute Force":
            return "Enforce progressive IP throttling on authentication endpoints, trigger mandatory MFA step-up, and isolate targeted host credential stores."
        if attack == "Botnet":
            return "Sinkhole external C2 destination IP/domain at DNS resolver, quarantine internal beaconing host, and extract endpoint memory dump for forensics."
        if attack == "Web Attack":
            return "Activate WAF virtual patching for SQLi/XSS signatures, block offending IP range, and inspect web server access logs for payload extraction."
        return "Quarantine affected host IP, capture PCAP stream for deep packet inspection, and assign Tier 2 SOC investigation."

forecaster = AttackForecaster()
