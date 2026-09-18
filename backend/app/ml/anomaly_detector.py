import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        self._fit_baseline()

    def _fit_baseline(self):
        np.random.seed(42)
        # Synthetic baseline benign feature matrix
        normal_samples = np.random.normal(
            loc=[35.0, 25000.0, 20.0, 1.0, 0.08, 0.02, 2.5, 0.18, 550.0],
            scale=[8.0, 6000.0, 5.0, 0.5, 0.02, 0.01, 0.4, 0.05, 80.0],
            size=(500, 9)
        )
        self.model.fit(normal_samples)

    def score(self, features: Dict[str, Any]) -> float:
        """
        Returns an anomaly score between 0.0 (benign) and 1.0 (highly anomalous).
        """
        analysis = self.analyze(features)
        return analysis["anomaly_score"]

    def analyze(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates baseline divergence and identifies specific deviant statistical signals.
        Answers: 'What is anomalous now?'
        """
        pkt_rate = float(features.get("packet_rate", 35.0))
        byte_rate = float(features.get("byte_rate", 25000.0))
        active_conns = float(features.get("active_connections", 20.0))
        failed_conns = float(features.get("failed_connections", 1.0))
        syn_ratio = float(features.get("syn_ratio", 0.08))
        rst_ratio = float(features.get("rst_ratio", 0.02))
        port_entropy = float(features.get("port_entropy", 2.5))
        dst_conc = float(features.get("destination_concentration", 0.18))
        mean_pkt_size = float(features.get("mean_packet_size", 550.0))

        vec = np.array([[
            pkt_rate, byte_rate, active_conns, failed_conns,
            syn_ratio, rst_ratio, port_entropy, dst_conc, mean_pkt_size
        ]])

        raw_score = self.model.decision_function(vec)[0]
        normalized_score = 1.0 / (1.0 + np.exp(raw_score * 4.0))
        score_val = round(float(normalized_score), 4)

        # Baseline specifications: (mean, std, friendly_name)
        baselines = {
            "packet_rate": (35.0, 8.0, "Packet Ingress Velocity (pps)"),
            "syn_ratio": (0.08, 0.02, "SYN Flag Disproportion"),
            "rst_ratio": (0.02, 0.01, "RST Connection Rejections"),
            "failed_connections": (1.0, 0.5, "Authentication & Connection Failures"),
            "destination_concentration": (0.18, 0.05, "Target IP Focus Concentration"),
            "port_entropy": (2.5, 0.4, "Port Entropy / Sweep Dispersion"),
            "byte_rate": (25000.0, 6000.0, "Volumetric Byte Rate (Bps)"),
        }

        deviations = []
        for feat_name, (b_mean, b_std, label) in baselines.items():
            val = float(features.get(feat_name, b_mean))
            z_score = (val - b_mean) / b_std
            if abs(z_score) >= 2.0:
                direction = "elevated" if z_score > 0 else "suppressed"
                deviations.append({
                    "metric": feat_name,
                    "label": label,
                    "observed": round(val, 2),
                    "baseline_mean": b_mean,
                    "z_score": round(z_score, 2),
                    "direction": direction,
                    "severity": "critical" if abs(z_score) >= 4.0 else "high" if abs(z_score) >= 3.0 else "medium"
                })

        return {
            "anomaly_score": score_val,
            "is_anomalous": score_val > 0.40 or len(deviations) > 0,
            "deviant_signals": sorted(deviations, key=lambda x: abs(x["z_score"]), reverse=True),
            "baseline_drift_magnitude": round(float(abs(raw_score)), 3)
        }

anomaly_detector = AnomalyDetector()
