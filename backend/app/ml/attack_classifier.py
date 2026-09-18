import os
import joblib
import numpy as np
from typing import Dict, Any, List, Tuple
from app.config import settings

ATTACK_CLASSES = [
    "Normal",
    "DDoS",
    "DoS",
    "Port Scan",
    "Brute Force",
    "Botnet",
    "Web Attack",
    "Infiltration",
    "Malware-related traffic",
    "Credential attack"
]

class AttackClassifier:
    def __init__(self):
        self.classes = ATTACK_CLASSES
        self.model_path = os.path.join(settings.MODEL_DIR, "attack_classifier.pkl")
        self.model = None
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                return
            except Exception:
                pass
        self._train_baseline_model()

    def _train_baseline_model(self):
        """
        Calibrates a multi-class Random Forest model on synthesized representative
        network flow signatures mirroring CICIDS/NSL-KDD benchmarks.
        """
        from sklearn.ensemble import RandomForestClassifier
        
        np.random.seed(42)
        X_train = []
        y_train = []

        # Synthetic benchmark distributions for the 10 classes
        # Features: [packet_rate, byte_rate, active_conns, failed_conns, syn_ratio, rst_ratio, port_entropy, dst_concentration, mean_packet_size]
        profiles = {
            "Normal": {"packet_rate": (20, 80), "byte_rate": (10000, 60000), "conns": (10, 40), "failed": (0, 2), "syn": (0.05, 0.15), "rst": (0.01, 0.05), "entropy": (2.0, 3.5), "conc": (0.1, 0.3), "size": (400, 800)},
            "DDoS": {"packet_rate": (800, 3000), "byte_rate": (800000, 5000000), "conns": (200, 800), "failed": (20, 100), "syn": (0.75, 0.98), "rst": (0.2, 0.5), "entropy": (0.2, 1.2), "conc": (0.85, 0.99), "size": (60, 140)},
            "DoS": {"packet_rate": (300, 900), "byte_rate": (200000, 900000), "conns": (80, 250), "failed": (15, 60), "syn": (0.6, 0.85), "rst": (0.1, 0.3), "entropy": (0.5, 1.8), "conc": (0.7, 0.9), "size": (100, 300)},
            "Port Scan": {"packet_rate": (150, 600), "byte_rate": (30000, 120000), "conns": (100, 400), "failed": (40, 180), "syn": (0.7, 0.95), "rst": (0.6, 0.95), "entropy": (4.5, 6.0), "conc": (0.05, 0.25), "size": (40, 80)},
            "Brute Force": {"packet_rate": (60, 250), "byte_rate": (40000, 150000), "conns": (30, 120), "failed": (25, 95), "syn": (0.2, 0.45), "rst": (0.15, 0.4), "entropy": (1.0, 2.2), "conc": (0.8, 0.98), "size": (250, 550)},
            "Botnet": {"packet_rate": (40, 160), "byte_rate": (25000, 100000), "conns": (20, 80), "failed": (5, 20), "syn": (0.15, 0.35), "rst": (0.05, 0.15), "entropy": (3.0, 4.8), "conc": (0.4, 0.7), "size": (300, 600)},
            "Web Attack": {"packet_rate": (50, 200), "byte_rate": (50000, 200000), "conns": (15, 50), "failed": (10, 40), "syn": (0.1, 0.3), "rst": (0.05, 0.2), "entropy": (1.5, 2.8), "conc": (0.75, 0.95), "size": (600, 1400)},
            "Infiltration": {"packet_rate": (30, 110), "byte_rate": (20000, 80000), "conns": (10, 35), "failed": (2, 10), "syn": (0.1, 0.25), "rst": (0.02, 0.1), "entropy": (2.2, 3.8), "conc": (0.3, 0.6), "size": (500, 950)},
            "Malware-related traffic": {"packet_rate": (80, 320), "byte_rate": (70000, 350000), "conns": (25, 90), "failed": (8, 30), "syn": (0.2, 0.4), "rst": (0.08, 0.25), "entropy": (2.8, 4.2), "conc": (0.5, 0.8), "size": (450, 900)},
            "Credential attack": {"packet_rate": (70, 280), "byte_rate": (45000, 180000), "conns": (40, 140), "failed": (30, 110), "syn": (0.25, 0.5), "rst": (0.2, 0.45), "entropy": (1.2, 2.4), "conc": (0.85, 0.99), "size": (280, 580)},
        }

        for class_idx, (class_name, p) in enumerate(profiles.items()):
            n_samples = 120
            for _ in range(n_samples):
                vec = [
                    np.random.uniform(*p["packet_rate"]),
                    np.random.uniform(*p["byte_rate"]),
                    np.random.uniform(*p["conns"]),
                    np.random.uniform(*p["failed"]),
                    np.random.uniform(*p["syn"]),
                    np.random.uniform(*p["rst"]),
                    np.random.uniform(*p["entropy"]),
                    np.random.uniform(*p["conc"]),
                    np.random.uniform(*p["size"]),
                ]
                X_train.append(vec)
                y_train.append(class_idx)

        clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
        clf.fit(X_train, y_train)
        self.model = clf
        try:
            joblib.dump(self.model, self.model_path)
        except Exception:
            pass

    def _extract_vector(self, features: Dict[str, Any]) -> List[float]:
        return [
            float(features.get("packet_rate", 25.0)),
            float(features.get("byte_rate", 15000.0)),
            float(features.get("active_connections", 15)),
            float(features.get("failed_connections", 0)),
            float(features.get("syn_ratio", 0.08)),
            float(features.get("rst_ratio", 0.02)),
            float(features.get("port_entropy", 2.4)),
            float(features.get("destination_concentration", 0.15)),
            float(features.get("mean_packet_size", 512.0)),
        ]

    def predict(self, features: Dict[str, Any]) -> Tuple[str, float, Dict[str, float]]:
        """
        Returns (predicted_class, confidence, probability_distribution_dict)
        """
        vec = np.array([self._extract_vector(features)])
        probs = self.model.predict_proba(vec)[0]
        max_idx = int(np.argmax(probs))
        predicted_class = self.classes[max_idx]
        confidence = float(probs[max_idx])
        
        prob_dict = {self.classes[i]: round(float(probs[i]), 4) for i in range(len(self.classes))}
        return predicted_class, confidence, prob_dict

classifier = AttackClassifier()
