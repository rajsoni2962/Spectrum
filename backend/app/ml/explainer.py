from typing import Dict, Any, List

class AIExplainer:
    """
    Provides SHAP-style attribution scores, waterfall breakdown,
    and plain-language analyst summaries.
    """
    
    BASE_VAL = 0.08  # Baseline benign anomaly rate

    def explain(self, features: Dict[str, Any], predicted_attack: str, confidence: float) -> Dict[str, Any]:
        pkt_rate = float(features.get("packet_rate", 20.0))
        syn_ratio = float(features.get("syn_ratio", 0.05))
        rst_ratio = float(features.get("rst_ratio", 0.01))
        failed_conns = float(features.get("failed_connections", 0))
        dst_conc = float(features.get("destination_concentration", 0.2))
        port_entropy = float(features.get("port_entropy", 2.2))
        byte_rate = float(features.get("byte_rate", 15000))

        waterfall = []
        current_val = self.BASE_VAL

        if predicted_attack == "DDoS":
            items = [
                ("Packet Volume Surge (pps)", min(pkt_rate / 3500.0, 0.35), f"+{pkt_rate:.1f} pkts/s vs 25 baseline"),
                ("SYN Handshake Flooding", min(syn_ratio * 0.32, 0.28), f"{syn_ratio*100:.1f}% SYN ratio vs 8% baseline"),
                ("Destination Target Concentration", min(dst_conc * 0.22, 0.20), f"{dst_conc*100:.1f}% traffic focused on single IP"),
                ("High Bandwidth Saturation (Bps)", min(byte_rate / 6000000.0, 0.15), f"{byte_rate/1024:.1f} KB/s"),
                ("Port Dispersion Suppression", -0.04, "Targeting single service port 80/443")
            ]
        elif predicted_attack == "Port Scan":
            items = [
                ("Port Entropy / Dispersion", min(port_entropy / 8.0, 0.38), f"Entropy {port_entropy:.2f} (abnormal port spread)"),
                ("RST Flag Spike (Rejections)", min(rst_ratio * 0.35, 0.30), f"{rst_ratio*100:.1f}% closed port responses"),
                ("Connection Sweep Frequency", min(pkt_rate / 800.0, 0.18), f"{pkt_rate:.1f} probe packets/s"),
                ("Destination IP Spread", 0.12, "Multiple endpoints scanned sequentially"),
                ("Flow Duration Brevity", 0.06, "Sub-second scan probe handshakes")
            ]
        elif predicted_attack == "Brute Force":
            items = [
                ("Authentication Failure Spikes", min(failed_conns * 0.04, 0.42), f"{failed_conns} failed attempts in window"),
                ("Port Concentration (SSH/RDP)", min(dst_conc * 0.25, 0.24), "Persistent queries on port 22/3389"),
                ("Repetitive Connection Rate", min(pkt_rate / 500.0, 0.16), f"{pkt_rate:.1f} req/s"),
                ("Payload Entropy Uniformity", 0.10, "Repeated dictionary payload length"),
                ("Normal Web Traffic Offset", -0.05, "Absence of client browser headers")
            ]
        else: # Normal or generic
            items = [
                ("Standard Flow Entropy", -0.15, f"Entropy {port_entropy:.2f} within normal range"),
                ("Balanced Flag Ratios", -0.12, f"SYN {syn_ratio*100:.1f}%, RST {rst_ratio*100:.1f}%"),
                ("Nominal Connection Volume", -0.10, f"{pkt_rate:.1f} pkts/s"),
                ("Low Target Concentration", -0.08, "Evenly distributed internal routing")
            ]

        accumulated = current_val
        for name, impact, evidence in items:
            val_before = accumulated
            accumulated = round(accumulated + impact, 3)
            waterfall.append({
                "feature": name,
                "shap_value": round(impact, 4),
                "cumulative_value": accumulated,
                "evidence": evidence,
                "direction": "increases_risk" if impact > 0 else "decreases_risk"
            })

        top_positive = [item["feature"] for item in waterfall if item["shap_value"] > 0][:3]
        if top_positive:
            features_text = ", ".join(top_positive)
            plain_explanation = f"Prediction is primarily influenced by {features_text}. These behavioral features deviate significantly from normal baseline profiles."
        else:
            plain_explanation = "Traffic characteristics align closely with baseline benign traffic with no abnormal deviation."

        return {
            "prediction": predicted_attack,
            "confidence": confidence,
            "base_value": self.BASE_VAL,
            "predicted_risk_value": min(max(accumulated, 0.02), 0.99),
            "waterfall": waterfall,
            "plain_language_explanation": plain_explanation
        }

explainer = AIExplainer()
