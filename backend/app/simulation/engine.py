import asyncio
import random
import datetime
from typing import Dict, Any, List, Optional
from app.ml.feature_extractor import extract_features_from_events
from app.ml.forecaster import forecaster
from app.ml.explainer import explainer
from app.ml.anomaly_detector import anomaly_detector

INTERNAL_ASSETS = [
    {"ip": "10.0.1.15", "hostname": "web-prod-01.corp", "role": "web_server"},
    {"ip": "10.0.1.20", "hostname": "db-cluster-primary.corp", "role": "database"},
    {"ip": "10.0.1.5", "hostname": "dc-auth-01.corp", "role": "domain_controller"},
    {"ip": "10.0.1.1", "hostname": "gw-perimeter-fw.corp", "role": "firewall"},
    {"ip": "10.0.2.45", "hostname": "ws-analyst-08.corp", "role": "workstation"},
]

EXTERNAL_IPS = [
    "198.51.100.44",
    "203.0.113.88",
    "45.33.32.156",
    "185.220.101.5",
    "91.240.118.22",
    "194.26.29.112"
]

SCENARIO_MITRE = {
    "DDoS": {"id": "T1498", "name": "Network Denial of Service", "category": "Impact"},
    "Port Scan": {"id": "T1046", "name": "Network Service Discovery", "category": "Discovery"},
    "Brute Force": {"id": "T1110", "name": "Brute Force Authentication", "category": "Credential Access"},
    "Botnet": {"id": "T1071", "name": "Application Layer Protocol C2", "category": "Command and Control"},
    "Web Attack": {"id": "T1190", "name": "Exploit Public-Facing Application", "category": "Initial Access"},
    "Normal": {"id": "None", "name": "Baseline Operations", "category": "Benign"}
}

class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.mode = "simulation"  # 'simulation', 'replay', 'idle', 'live'
        self.active_scenario = "Normal"
        self.speed = 1.0
        self.step_count = 0
        self.listeners: List[Any] = []
        self._task: Optional[asyncio.Task] = None
        
        # Replay dataset
        self.replay_dataset: List[Dict[str, Any]] = []
        self.replay_index: int = 0

        # Latest computed states
        self.latest_events: List[Dict[str, Any]] = []
        self.latest_features: Dict[str, Any] = {}
        self.latest_forecast: Dict[str, Any] = {}
        self.latest_explainability: Dict[str, Any] = {}
        self.latest_anomaly_score: float = 0.05
        self.live_stats: Dict[str, Any] = {}
        
        # In-memory incident and alert stores for quick access
        self.generated_alerts: List[Dict[str, Any]] = []
        self.generated_incidents: List[Dict[str, Any]] = []
        
        # Initialize with baseline normal state
        self._generate_tick_events()
        self._process_detection_pipeline()

    def set_mode(self, mode: str):
        if mode in ["simulation", "replay", "idle", "live"]:
            self.mode = mode
            if mode == "idle":
                self._process_idle_state()

    def set_scenario(self, scenario_name: str):
        if scenario_name in ["Normal", "Port Scan", "Brute Force", "DDoS", "Botnet", "Web Attack"]:
            self.active_scenario = scenario_name
            self.mode = "simulation"

    def load_replay_dataset(self, events: List[Dict[str, Any]]):
        self.replay_dataset = events
        self.replay_index = 0
        self.mode = "replay"

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_loop())

    def stop(self):
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()

    async def _run_loop(self):
        while self.is_running:
            try:
                self.step()
                await self._notify_listeners()
                await asyncio.sleep(1.0 / max(self.speed, 0.2))
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[SimulationEngine Error] {e}")
                await asyncio.sleep(1.0)

    def step(self):
        """Advances the telemetry pipeline by one discrete tick."""
        self.step_count += 1
        if self.mode == "idle":
            self._process_idle_state()
        elif self.mode == "replay":
            self._process_replay_tick()
            self._process_detection_pipeline()
        else:
            self._generate_tick_events()
            self._process_detection_pipeline()

    def _process_idle_state(self):
        """Transparently handles inactive telemetry state without inventing metrics."""
        self.latest_events = []
        self.latest_features = {
            "packet_rate": 0.0,
            "byte_rate": 0.0,
            "active_connections": 0,
            "failed_connections": 0,
            "unique_src_ips": 0,
            "unique_dst_ips": 0,
            "tcp_udp_ratio": 1.0,
            "syn_ratio": 0.0,
            "rst_ratio": 0.0,
            "port_entropy": 0.0,
            "destination_concentration": 0.0,
            "mean_packet_size": 0.0,
            "std_packet_size": 0.0
        }
        self.latest_anomaly_score = 0.0
        self.latest_forecast = {
            "current_threat_state": "Normal",
            "overall_risk_score": 0.0,
            "predicted_attack": "Inactive (Standby)",
            "attack_probability": 0.0,
            "forecast_horizon_seconds": 0,
            "confidence_score": 0.0,
            "historical_trend": "stable",
            "contributing_features": [],
            "ai_reasoning": "Telemetry ingress is currently inactive. No live network flows or simulation events are detected.",
            "recommended_action": "Enable a simulation scenario or configure an active live connector in Data Sources.",
            "all_class_probabilities": {"Normal": 1.0},
            "is_telemetry_active": False,
            "now": {"anomaly_score": 0.0, "is_anomalous": False, "deviant_signals": [], "baseline_drift_magnitude": 0.0},
            "trajectory": {"velocity_packet_rate": 0.0, "velocity_syn_ratio": 0.0, "velocity_failed_connections": 0.0, "forecast_horizon_seconds": 0, "historical_trend": "stable", "projected_curve": [], "threat_state": "Normal"},
            "classification": {"predicted_attack": "None", "confidence": 0.0, "all_class_probabilities": {"Normal": 1.0}}
        }
        self.latest_explainability = {
            "prediction": "None",
            "confidence": 0.0,
            "base_value": 0.0,
            "predicted_risk_value": 0.0,
            "waterfall": [],
            "plain_language_explanation": "Network telemetry stream is idle. Connect a live telemetry source or start a simulation scenario."
        }
        self.live_stats = {
            "packets_per_sec": 0,
            "bytes_per_sec": 0,
            "active_connections": 0,
            "unique_source_ips": 0,
            "unique_destination_ips": 0,
            "tcp_udp_ratio": 0.0,
            "failed_connections": 0,
            "port_scanning_events": 0,
            "anomaly_score": 0.0,
            "is_simulated": False,
            "mode": "idle"
        }

    def _process_replay_tick(self):
        """Replays a slice of uploaded PCAP / CSV events."""
        if not self.replay_dataset:
            self.mode = "idle"
            self._process_idle_state()
            return

        batch_size = 20
        start = self.replay_index
        end = min(start + batch_size, len(self.replay_dataset))
        slice_events = self.replay_dataset[start:end]

        self.replay_index = end if end < len(self.replay_dataset) else 0
        now_str = datetime.datetime.utcnow().isoformat() + "Z"

        self.latest_events = [
            {
                "timestamp": now_str,
                "source_ip": e.get("source_ip", "192.168.1.50"),
                "destination_ip": e.get("destination_ip", "10.0.1.15"),
                "protocol": e.get("protocol", "TCP"),
                "source_port": e.get("source_port", 45123),
                "destination_port": e.get("destination_port", 80),
                "packets": e.get("packets", 1),
                "bytes": e.get("bytes", 64),
                "tcp_flags": e.get("tcp_flags", "ACK"),
                "flow_duration": e.get("flow_duration", 0.01),
                "risk_level": "medium" if e.get("tcp_flags") in ["SYN", "RST"] else "low",
                "risk_score": 50.0 if e.get("tcp_flags") in ["SYN", "RST"] else 10.0,
                "status": "inspected",
                "is_simulated": True
            }
            for e in slice_events
        ]

    def _generate_tick_events(self):
        """Generates realistic packet flows based on the active scenario."""
        events = []
        now = datetime.datetime.utcnow()

        if self.active_scenario == "Normal":
            n_events = random.randint(15, 30)
            for _ in range(n_events):
                src = random.choice(["10.0.2.45", "10.0.2.88", "198.51.100.44", "10.0.1.15"])
                dst = random.choice(["10.0.1.15", "10.0.1.20", "10.0.1.5", "8.8.8.8"])
                proto = random.choice(["TCP", "TCP", "TCP", "UDP", "HTTPS"])
                port = random.choice([80, 443, 53, 3306, 8080])
                pkts = random.randint(1, 8)
                bytes_count = pkts * random.randint(120, 1400)
                flags = random.choice(["ACK", "PSH, ACK", "SYN, ACK", "FIN, ACK"])
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": src,
                    "destination_ip": dst,
                    "protocol": proto,
                    "source_port": random.randint(30000, 65000),
                    "destination_port": port,
                    "packets": pkts,
                    "bytes": bytes_count,
                    "tcp_flags": flags,
                    "flow_duration": round(random.uniform(0.01, 1.2), 3),
                    "risk_level": "low",
                    "risk_score": round(random.uniform(2.0, 12.0), 1),
                    "status": "allowed",
                    "is_simulated": True
                })

        elif self.active_scenario == "DDoS":
            # High volume volumetric SYN flood against Web Server (10.0.1.15)
            target = "10.0.1.15"
            n_events = random.randint(120, 260)
            for _ in range(n_events):
                src = random.choice(EXTERNAL_IPS)
                pkts = random.randint(40, 150)
                bytes_count = pkts * random.randint(64, 120)
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": src,
                    "destination_ip": target,
                    "protocol": "TCP",
                    "source_port": random.randint(1024, 65535),
                    "destination_port": 443,
                    "packets": pkts,
                    "bytes": bytes_count,
                    "tcp_flags": "SYN",
                    "flow_duration": round(random.uniform(0.001, 0.05), 4),
                    "risk_level": "critical",
                    "risk_score": round(random.uniform(85.0, 99.5), 1),
                    "status": "flagged",
                    "is_simulated": True
                })

        elif self.active_scenario == "Port Scan":
            # Attacker scanning range of ports on Domain Controller (10.0.1.5)
            attacker = "45.33.32.156"
            target = "10.0.1.5"
            n_events = random.randint(40, 80)
            for _ in range(n_events):
                port = random.randint(1, 1024)
                is_closed = port not in [53, 88, 389, 445]
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": attacker,
                    "destination_ip": target,
                    "protocol": "TCP",
                    "source_port": random.randint(40000, 60000),
                    "destination_port": port,
                    "packets": 1,
                    "bytes": 48,
                    "tcp_flags": "RST, ACK" if is_closed else "SYN, ACK",
                    "flow_duration": 0.005,
                    "risk_level": "high",
                    "risk_score": round(random.uniform(70.0, 88.0), 1),
                    "status": "blocked" if is_closed else "flagged",
                    "is_simulated": True
                })

        elif self.active_scenario == "Brute Force":
            attacker = "185.220.101.5"
            target = "10.0.1.20"  # DB server SSH / MySQL
            n_events = random.randint(30, 60)
            for _ in range(n_events):
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": attacker,
                    "destination_ip": target,
                    "protocol": "TCP",
                    "source_port": random.randint(35000, 55000),
                    "destination_port": 22,
                    "packets": random.randint(4, 12),
                    "bytes": random.randint(300, 800),
                    "tcp_flags": "RST",
                    "flow_duration": round(random.uniform(0.1, 0.4), 2),
                    "risk_level": "high",
                    "risk_score": round(random.uniform(68.0, 84.0), 1),
                    "status": "blocked",
                    "is_simulated": True
                })

        elif self.active_scenario == "Botnet":
            compromised_host = "10.0.2.45"
            c2_server = "91.240.118.22"
            n_events = random.randint(15, 35)
            for _ in range(n_events):
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": compromised_host,
                    "destination_ip": c2_server,
                    "protocol": "DNS" if random.random() < 0.5 else "TCP",
                    "source_port": random.randint(45000, 65000),
                    "destination_port": 53 if random.random() < 0.5 else 8443,
                    "packets": random.randint(2, 6),
                    "bytes": random.randint(220, 650),
                    "tcp_flags": "PSH, ACK",
                    "flow_duration": round(random.uniform(0.2, 0.8), 2),
                    "risk_level": "high",
                    "risk_score": round(random.uniform(65.0, 82.0), 1),
                    "status": "flagged",
                    "is_simulated": True
                })

        elif self.active_scenario == "Web Attack":
            attacker = "194.26.29.112"
            target = "10.0.1.15"
            n_events = random.randint(25, 45)
            for _ in range(n_events):
                events.append({
                    "timestamp": now.isoformat() + "Z",
                    "source_ip": attacker,
                    "destination_ip": target,
                    "protocol": "HTTP",
                    "source_port": random.randint(30000, 60000),
                    "destination_port": 80,
                    "packets": random.randint(3, 10),
                    "bytes": random.randint(850, 2400),
                    "tcp_flags": "ACK",
                    "flow_duration": round(random.uniform(0.05, 0.3), 2),
                    "risk_level": "high",
                    "risk_score": round(random.uniform(72.0, 89.0), 1),
                    "status": "flagged",
                    "is_simulated": True
                })

        self.latest_events = events

    def _process_detection_pipeline(self):
        """Passes generated events into ML extraction, forecasting, and explainability."""
        features = extract_features_from_events(self.latest_events, window_seconds=1.0)
        self.latest_features = features

        # Anomaly scoring
        self.latest_anomaly_score = anomaly_detector.score(features)

        # Attack Forecasting
        forecast_result = forecaster.forecast(features)
        self.latest_forecast = forecast_result

        # Explainability
        explanation = explainer.explain(
            features=features,
            predicted_attack=forecast_result["predicted_attack"],
            confidence=forecast_result["confidence_score"]
        )
        self.latest_explainability = explanation

        # Live stats
        total_pkts = sum(e["packets"] for e in self.latest_events)
        total_bytes = sum(e["bytes"] for e in self.latest_events)
        unique_src = len(set(e["source_ip"] for e in self.latest_events))
        unique_dst = len(set(e["destination_ip"] for e in self.latest_events))
        failed_count = sum(1 for e in self.latest_events if e["status"] in ["blocked", "flagged"])
        port_scans = sum(1 for e in self.latest_events if "RST" in e.get("tcp_flags", ""))

        self.live_stats = {
            "packets_per_sec": total_pkts,
            "bytes_per_sec": total_bytes,
            "active_connections": len(self.latest_events),
            "unique_source_ips": unique_src,
            "unique_destination_ips": unique_dst,
            "tcp_udp_ratio": features.get("tcp_udp_ratio", 4.0),
            "failed_connections": failed_count,
            "port_scanning_events": port_scans,
            "anomaly_score": self.latest_anomaly_score,
            "is_simulated": True
        }

        # Check thresholds for alert and incident creation
        risk = forecast_result["overall_risk_score"]
        if risk > 60.0 and self.active_scenario != "Normal":
            self._trigger_auto_alert(forecast_result)
        if risk > 82.0 and self.active_scenario != "Normal":
            self._trigger_auto_incident(forecast_result)

    def _trigger_auto_alert(self, forecast_result: Dict[str, Any]):
        code = f"ALT-2026-0917-{len(self.generated_alerts) + 1:03d}"
        if any(a["alert_code"] == code for a in self.generated_alerts[-5:]):
            return

        mitre = SCENARIO_MITRE.get(self.active_scenario, {"id": "T1498", "name": "Network Attack"})
        severity = "Critical" if forecast_result["overall_risk_score"] > 80 else "High"

        alert = {
            "id": len(self.generated_alerts) + 1,
            "alert_code": code,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "severity": severity,
            "status": "Open",
            "title": f"Forecasted {forecast_result['predicted_attack']} Escalation Detected",
            "category": mitre["category"],
            "source_ip": self.latest_events[0]["source_ip"] if self.latest_events else "198.51.100.44",
            "destination_ip": self.latest_events[0]["destination_ip"] if self.latest_events else "10.0.1.15",
            "mitre_technique_id": mitre["id"],
            "attack_probability": forecast_result["attack_probability"],
            "confidence": forecast_result["confidence_score"],
            "assigned_to": "SOC Tier 1 Queue",
            "description": forecast_result["ai_reasoning"],
            "analyst_notes": "Automated forecast trigger from SPECTRUM Forecasting Pipeline.",
            "is_simulated": True
        }
        self.generated_alerts.append(alert)

    def _trigger_auto_incident(self, forecast_result: Dict[str, Any]):
        inc_num = f"INC-2026-0917-{len(self.generated_incidents) + 42:04d}"
        if any(i["incident_number"] == inc_num for i in self.generated_incidents[-3:]):
            return

        mitre = SCENARIO_MITRE.get(self.active_scenario, {"id": "T1498", "name": "Network Denial of Service"})
        incident = {
            "id": len(self.generated_incidents) + 1,
            "incident_number": inc_num,
            "title": f"Active {forecast_result['predicted_attack']} Breach Escalation",
            "severity": "Critical",
            "status": "Investigating",
            "confidence": forecast_result["confidence_score"],
            "first_detected": datetime.datetime.utcnow().isoformat() + "Z",
            "last_activity": datetime.datetime.utcnow().isoformat() + "Z",
            "affected_assets": ["10.0.1.15 (web-prod-01)", "10.0.1.1 (gw-perimeter-fw)"],
            "ai_prediction": forecast_result["predicted_attack"],
            "mitre_technique_id": mitre["id"],
            "recommended_actions": [
                forecast_result["recommended_action"],
                "Isolate affected subnet on VLAN 12",
                "Generate PCAP forensic snapshot"
            ],
            "analyst_notes": "System automatically opened incident upon threshold escalation.",
            "assigned_analyst": "analyst@spectrum.internal",
            "is_simulated": True,
            "timeline": [
                {"time": "00:00:01", "event": "Early velocity spike detected in SYN flags"},
                {"time": "00:00:05", "event": f"Attack forecasted with {forecast_result['confidence_score']*100:.1f}% confidence"},
                {"time": "00:00:10", "event": "Risk threshold crossed 82% - Escalated to Critical Incident"}
            ]
        }
        self.generated_incidents.append(incident)

    async def _notify_listeners(self):
        payload = {
            "type": "TELEMETRY_UPDATE",
            "mode": self.mode,
            "scenario": self.active_scenario,
            "is_simulated": self.mode in ["simulation", "replay"],
            "is_telemetry_active": self.mode != "idle",
            "step": self.step_count,
            "live_stats": self.live_stats,
            "forecast": self.latest_forecast,
            "explainability": self.latest_explainability,
            "recent_events": self.latest_events[:15],
            "active_alerts_count": len([a for a in self.generated_alerts if a["status"] in ["Open", "NEW"]]),
            "active_incidents_count": len([i for i in self.generated_incidents if i["status"] in ["Open", "Investigating"]])
        }
        for listener in list(self.listeners):
            try:
                await listener(payload)
            except Exception:
                pass

simulation_engine = SimulationEngine()
