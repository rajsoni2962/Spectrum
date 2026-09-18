# KRATOS X
### AI-Powered Network Security & Attack Forecasting Platform
**Predict threats. Understand attacks. Respond faster.**

[![System Status](https://img.shields.io/badge/System-Operational-36D399?style=flat-square)](#)
[![Python](https://img.shields.io/badge/Python-3.11-4F8CFF?style=flat-square)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-36D399?style=flat-square)](#)
[![React](https://img.shields.io/badge/React-19.2-4F8CFF?style=flat-square)](#)
[![ML Ensemble](https://img.shields.io/badge/ML%20Ensemble-RF%20%2B%20Isolation-FFB547?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Proprietary-gray?style=flat-square)](#)

---

## Executive Overview

**KRATOS X** is a commercial-grade enterprise Security Operations Center (SOC) platform engineered to analyze continuous network flow telemetry and behavioral features to **forecast potential cyberattacks before or while they escalate**.

### Core Differentiator: Attack Forecasting (Not Just Intrusion Detection)
Traditional Intrusion Detection Systems (IDS) alert only *after* signatures match an ongoing breach or when service availability is already compromised. 

KRATOS X introduces **Temporal Attack Forecasting**:
- Computes behavioral feature drift and velocity across sliding time windows.
- Predicts attack type, escalation trajectory, and risk percentage before critical impact.
- Calculates an advance **forecast horizon** (e.g. 15s to 120s early warning).
- Explains model reasoning using **SHAP-style local Shapley feature attributions**.
- Issues automated tactical response playbooks to mitigate the threat *before* service disruption.

---

## SOC Visual Style & Design Language

Designed following strict dark enterprise SOC guidelines:
- **Background**: `#080B12`
- **Secondary Background**: `#0F1420`
- **Cards**: `#151B27`
- **Borders**: `#252D3A`
- **Primary Text**: `#F3F5F7`
- **Secondary Text**: `#8E99A8`
- **Primary Accent**: `#4F8CFF`
- **Severity Colors**: Critical (`#FF2E63`), High (`#FF4D5E`), Medium (`#FFB547`), Healthy (`#36D399`)
- Information-dense, clean typography, desktop-first responsive layout, and zero generic clichés.

---

## Platform Architecture & Navigation

The platform provides a fixed enterprise navigation sidebar across 18 specialized sections:

```
KRATOSX SOC PLATFORM
├── OVERVIEW
│   └── Dashboard                    [Real-time KPIs, Risk Timeline, Threat Stream, Top IPs]
├── DETECTION
│   ├── Live Monitor                 [WebSocket stream, packets/sec, TCP/UDP ratio, filter table]
│   ├── Attack Forecast              [Central Engine: Probability, Horizon, Trajectory, Radar]
│   ├── Alerts                       [Triage queue, severity, Acknowledge, Investigate, Resolve]
│   └── Incidents                    [INC-2026-0917-XXXX, affected assets, MITRE, timeline, notes]
├── ANALYSIS
│   ├── Network Explorer             [Interactive topology graph, packet pulses, asset inspector]
│   ├── Traffic Analysis             [Deep packet flow inspection, protocol histograms, port dispersion]
│   ├── Investigation                [Analyst-grade investigation workflow, forensic correlation]
│   └── Threat Intelligence          [IoC library, reputation scores, threat actors, malware families]
├── AI
│   ├── AI Insights                  [Data-backed emerging threats, empirical evidence citations]
│   ├── Model Performance            [Confusion matrix, ROC-AUC curve, per-class F1 benchmarks]
│   └── Explainability               [SHAP waterfall, feature attribution, plain-language reasoning]
├── REPORTING
│   ├── Reports                      [Automated ReportLab PDF compiler, executive briefs]
│   └── Export Center                [CSV telemetry export, JSON schema dump, SQL DDL]
└── SYSTEM
    ├── Data Sources                 [PCAP/CSV upload with UUID sanitization, Zeek connectors]
    ├── Users & Roles                [RBAC: Admin, SOC Analyst, Security Manager, Viewer]
    ├── System Health                [Subsystem daemons, latency, uptime, audit trail]
    └── Settings                     [Detection thresholds, velocity windows, webhook endpoints]
```

---

## Machine Learning Architecture

The detection and forecasting engine combines supervised and unsupervised models:
1. **Feature Extractor** (`app/ml/feature_extractor.py`): Computes 24 behavioral and statistical flow metrics (packet rate, byte rate, active connections, failed connections, SYN/RST flag ratios, destination concentration, Shannon port entropy, packet length variance, and protocol disparity).
2. **Anomaly Detector** (`app/ml/anomaly_detector.py`): Unsupervised Isolation Forest model calculating behavioral baseline divergence (0.0 to 1.0).
3. **Multi-Class Attack Classifier** (`app/ml/attack_classifier.py`): Trained multi-class Random Forest supporting 10 distinct classes:
   - `Normal`
   - `DDoS` (Volumetric SYN/UDP flood)
   - `DoS` (Application Slowloris / HTTP flood)
   - `Port Scan` (Service discovery & sweep)
   - `Brute Force` (Authentication burst)
   - `Botnet` (C2 beaconing & DNS tunneling)
   - `Web Attack` (SQLi, XSS, directory fuzzing)
   - `Infiltration` (Privilege escalation)
   - `Malware-related traffic` (Lateral movement)
   - `Credential attack` (Kerberoasting, credential stuffing)
4. **Temporal Attack Forecaster** (`app/ml/forecaster.py`): Calculates temporal velocity, acceleration of feature drift, threat states (`Normal`, `Elevated`, `Under Attack`, `Critical`), early-warning forecast horizon (15s–120s), and recommended tactical analyst actions.
5. **AI Explainer** (`app/ml/explainer.py`): Local Shapley value waterfall attribution and plain-language explanation synthesis.

---

## Attack Simulation Engine (6 Scenarios)

The built-in simulation engine generates realistic time-series network flows:
- **Normal Traffic**: Baseline benign enterprise operations (DNS, HTTPS, internal SQL queries). Stable risk (~8%).
- **DDoS**: High-volume SYN flood against `10.0.1.15` (web-prod-01). Surges packet rate to 45k+ pps, suppresses port entropy, drives risk to 99.8%.
- **Port Scan**: Reconnaissance sweep across closed ports on `10.0.1.5` (dc-auth-01) with high RST responses.
- **Brute Force**: High-frequency auth connection burst targeting port 22 on `10.0.1.20`.
- **Botnet**: Periodic C2 beaconing and irregular DNS query patterns to `91.240.118.22`.
- **Web Attack**: SQLi, XSS, and payload size variance targeting web servers.

All simulated data is transparently flagged with `[SIMULATED DATA]` tags to maintain complete technical honesty.

---

## Authorized Security Testing & Model Validation (Simulation Lab)

The platform includes a built-in **Simulation Lab** for authorized adversarial injection, model validation, and automated verification:

1. **Baseline SOC Telemetry Verification**: Inspect enterprise network baseline metrics, flow integrity, and live telemetry feeds.
2. **Passive Baseline Traffic Verification**: Verify standard benign operational telemetry (DNS, HTTPS, database queries) remains at nominal risk (~8%).
3. **Adversarial Volumetric Stress Injection (DDoS)**: Trigger controlled adversarial multi-source SYN volumetric flood against production web infrastructure.
4. **Ingress Telemetry & Flow Anomaly Observation**: Observe rapid surge in packet rate (45k+ pps), SYN handshake disproportion (92%), and widening TCP/UDP asymmetry.
5. **Neural Risk Escalation Evaluation**: The temporal velocity engine flags statistical feature drift across sliding windows, escalating overall risk from 8% to 92%.
6. **Pre-Attack Forecast Horizon Analysis**: Evaluates advance forecast horizon (45-second early warning window) prior to critical service saturation.
7. **Statistical Model Confidence Verification**: Random Forest multi-class ensemble combined with Isolation Forest confirms 96.2% statistical inference confidence.
8. **Transparent Explainability Attribution (SHAP)**: Inspect exact behavioral feature contributions: Packet Escalation (+36%), SYN Disproportion (+28%), and Target Concentration (+20%).
9. **Predictive Alert Generation Triage**: Automated predictive alert `ALT-2026-0917-001` is triggered and queued for Tier-1 SOC analyst review.
10. **Formal Incident Case Workspace Escalation**: Escalate to high-priority incident `INC-2026-0917-0042` with correlated evidence, timeline, and asset mapping.
11. **MITRE ATT&CK Mapping & Response Playbook**: Inspect direct mapping to MITRE ATT&CK T1498 (Network Denial of Service) and evaluate recommended tactical countermeasures.
12. **Executive Forensic Intelligence Brief Generation**: Compile and export formal ReportLab PDF incident forensic brief with cryptographic audit trail.

---

## Database Architecture

- **PostgreSQL DDL**: Fully authored production schema in `backend/app/db/init_schema.sql` covering all 16 normalized tables:
  `users`, `roles`, `network_sources`, `traffic_events`, `traffic_features`, `predictions`, `alerts`, `incidents`, `incident_events`, `assets`, `threat_indicators`, `mitre_techniques`, `model_versions`, `model_metrics`, `audit_logs`, `reports`.
- **Zero-Config Dual-Mode**: Defaults out-of-the-box to `sqlite+aiosqlite:///./kratosx.db` so the entire platform runs immediately with zero installation dependencies, while fully supporting production PostgreSQL via `DATABASE_URL=postgresql+asyncpg://...`.

---

## Running the Platform

### Option 1: Integrated Production Server (FastAPI + Embedded SPA)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- **SOC Web Platform**: [http://localhost:8000/](http://localhost:8000/)
- **Interactive Swagger Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Live WebSocket**: `ws://localhost:8000/api/v1/live/ws`

### Option 2: Development Mode (Vite Hot Reload + FastAPI)
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- **Vite Hot-Reload App**: [http://localhost:5173/](http://localhost:5173/)

### Automated Test Suite
```bash
python -m pytest backend/tests/test_backend.py -v
```
All 6 automated unit tests verify feature extraction, classification, forecasting, SHAP explainability, simulation ticks, and PDF report generation.
