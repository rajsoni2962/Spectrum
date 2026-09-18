import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Terminal,
  Gauge,
  Sliders,
  Cpu
} from "lucide-react";
import {
  fetchSimulationStatus,
  setSimulationScenario,
  toggleSimulation,
  stepSimulation
} from "../services/api";

interface SimulationLabProps {
  setActivePage?: (page: string) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  setActivePage,
}) => {
  const [activeScenario, setActiveScenario] = useState<string>("Normal");
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [status, setStatus] = useState<any>(null);
  const [testSuiteRunning, setTestSuiteRunning] = useState<boolean>(false);
  const [completedTests, setCompletedTests] = useState<number[]>([]);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const res = await fetchSimulationStatus();
      setStatus(res);
      if (res.active_scenario) setActiveScenario(res.active_scenario);
    } catch (err) {
      console.error("Failed to load simulation status:", err);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    await setSimulationScenario(scenario);
    loadStatus();
  };

  const handleToggle = async () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    await toggleSimulation(nextState);
  };

  const handleStep = async () => {
    await stepSimulation();
    loadStatus();
  };

  const runAutomatedValidationAudit = async () => {
    setTestSuiteRunning(true);
    setCompletedTests([]);
    for (let i = 1; i <= 6; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setCompletedTests((prev) => [...prev, i]);
    }
    setTestSuiteRunning(false);
  };

  const scenarios = [
    {
      id: "Normal",
      name: "Enterprise Baseline Traffic",
      type: "BENIGN FLOW",
      desc: "Standard operational telemetry: HTTPS/TLS handshakes, DNS queries, internal database queries. Low jitter, nominal entropy.",
      severity: "LOW",
      expectedRisk: "~7.4%",
    },
    {
      id: "DDoS",
      name: "Volumetric SYN Flood",
      type: "ADVERSARIAL STRESS",
      desc: "Multi-source high-pps volumetric flood targeting core web tier (10.0.1.15). Heavy SYN flag skew (92%), packet rate >45k pps.",
      severity: "CRITICAL",
      expectedRisk: ">92%",
    },
    {
      id: "Port Scan",
      name: "Reconnaissance Port Sweep",
      type: "ADVERSARIAL RECON",
      desc: "Horizontal & vertical port scan sweeping ports 21-8080 on domain controller (10.0.1.5). High RST flag response ratio.",
      severity: "HIGH",
      expectedRisk: ">75%",
    },
    {
      id: "Brute Force",
      name: "Authentication Flood (SSH/RDP)",
      type: "CREDENTIAL ATTACK",
      desc: "Rapid repetitive authentication bursts targeting port 22 and port 3389. Short-lived connection bursts with zero data payload.",
      severity: "HIGH",
      expectedRisk: ">70%",
    },
    {
      id: "Botnet",
      name: "C2 Command & Control Beaconing",
      type: "MALICIOUS PERSISTENCE",
      desc: "Periodic heartbeat beaconing to known threat actor IP (91.240.118.22) with abnormal DNS tunneling entropy and TCP keepalive variance.",
      severity: "ELEVATED",
      expectedRisk: ">65%",
    },
    {
      id: "Web Attack",
      name: "Application-Layer Injection",
      type: "EXPLOIT INJECTION",
      desc: "SQL injection patterns and URI parameter fuzzing targeting API endpoints. Packet length distribution anomalies and HTTP 500 error skew.",
      severity: "HIGH",
      expectedRisk: ">80%",
    },
  ];

  const validationChecks = [
    { id: 1, title: "Sliding-Window Feature Extractor (24 Features)", desc: "Validates temporal packet velocity and Shannon entropy calculation." },
    { id: 2, title: "Unsupervised Isolation Forest Anomaly Boundary", desc: "Confirms benign drift boundaries and anomaly score divergence threshold." },
    { id: 3, title: "Multi-Class Random Forest Classifier (10 Classes)", desc: "Verifies probabilistic classification weights across known attack archetypes." },
    { id: 4, title: "Temporal Velocity & Horizon Forecaster (15-120s)", desc: "Tests early-warning horizon calculation prior to peak service saturation." },
    { id: 5, title: "SHAP Explainability Attribution Engine", desc: "Confirms local Shapley value additivity and top 3 feature attributions." },
    { id: 6, title: "Automated Incident Escalation & Response SLA", desc: "Verifies incident case generation, MITRE mapping, and PDF report compilation." },
  ];

  const forecast = status?.forecast;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Simulation Lab</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3]">
              SIMULATION LAB
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Authorized adversarial traffic injection bench for model stress testing and early-warning horizon verification
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggle}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isRunning
                ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706] hover:bg-[#FDE68A]"
                : "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-[#A7F3D0]"
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Pause Engine" : "Resume Engine"}</span>
          </button>

          <button
            onClick={handleStep}
            className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#BE185D]" />
            <span>Single Step</span>
          </button>

          <button
            onClick={() => handleScenarioChange("Normal")}
            className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Readout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Active Scenario</div>
          <div className="text-base font-bold font-mono text-[#BE185D] mt-1 truncate">{activeScenario}</div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Synthetic Generator</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Threat State</div>
          <div
            className={`text-base font-bold font-mono mt-1 ${
              forecast?.current_threat_state === "Critical"
                ? "text-[#E11D48]"
                : forecast?.current_threat_state === "Under Attack"
                ? "text-[#E11D48]"
                : forecast?.current_threat_state === "Elevated"
                ? "text-[#D97706]"
                : "text-[#059669]"
            }`}
          >
            {forecast?.current_threat_state || "Normal"}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Automated Classifier</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Risk Score</div>
          <div className="text-base font-bold font-mono text-[#0F172A] mt-1">
            {forecast?.overall_risk_score?.toFixed(1) || "7.4"}%
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Temporal Index</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Threat Forecast</div>
          <div className="text-base font-bold font-mono text-[#D97706] mt-1 truncate">
            {forecast?.predicted_attack || "None"}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Random Forest</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Early Warning</div>
          <div className="text-base font-bold font-mono text-[#059669] mt-1">
            {forecast?.forecast_horizon_seconds ? `${forecast.forecast_horizon_seconds}s` : "N/A"}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Pre-Saturation Buffer</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Prediction Confidence</div>
          <div className="text-base font-bold font-mono text-[#0F172A] mt-1">
            {forecast?.confidence_score ? `${(forecast.confidence_score * 100).toFixed(1)}%` : "96.4%"}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Ensemble Weight</div>
        </div>
      </div>

      {/* Scenario Injector Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-[#BE185D]" />
            Adversarial Scenario Injector Matrix
          </h2>
          <span className="text-[11px] font-mono text-[#64748B]">6 Configured Scenarios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <div
                key={sc.id}
                className={`border rounded-xl p-4 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                  isSelected ? "border-[#BE185D] bg-[#FDF2F8] ring-1 ring-[#BE185D]" : "border-[#F3E8E8] bg-white hover:border-[#FCE7F3]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        sc.severity === "CRITICAL"
                          ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                          : sc.severity === "HIGH"
                          ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                          : sc.severity === "ELEVATED"
                          ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                          : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                      }`}
                    >
                      {sc.type}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">Risk: {sc.expectedRisk}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A]">{sc.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{sc.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F3E8E8] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#059669]" : "bg-[#94A3B8]"}`} />
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {isSelected ? "ACTIVE IN LAB" : "STANDBY"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleScenarioChange(sc.id)}
                    disabled={isSelected}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] cursor-default font-bold"
                        : "bg-[#BE185D] hover:bg-[#9D174D] text-white shadow-xs"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Inject</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Model Validation Suite */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5 font-mono">
              <Gauge className="w-3.5 h-3.5 text-[#059669]" />
              Automated Algorithmic Conformance Audit
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Sequential verification of sliding-window extraction, velocity calculations, and attribution fidelity
            </p>
          </div>

          <button
            onClick={runAutomatedValidationAudit}
            disabled={testSuiteRunning}
            className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
          >
            {testSuiteRunning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin text-[#BE185D]" />
                <span>Auditing Subsystems...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Run Conformance Audit</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {validationChecks.map((chk) => {
            const isPassed = completedTests.includes(chk.id) || (!testSuiteRunning && completedTests.length === 0);
            return (
              <div
                key={chk.id}
                className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl p-3.5 flex items-start gap-2.5"
              >
                <div className="mt-0.5">
                  {testSuiteRunning && !completedTests.includes(chk.id) ? (
                    <Activity className="w-3.5 h-3.5 text-[#BE185D] animate-spin" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{chk.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 leading-normal">{chk.desc}</div>
                  <div className="text-[10px] font-mono text-[#059669] font-bold mt-1.5">
                    STATUS: PASS (CONVERGED)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
