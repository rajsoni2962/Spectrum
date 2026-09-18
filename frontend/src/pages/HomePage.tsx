import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Compass,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Layers
} from "lucide-react";
import { SpectrumLogo } from "../components/SpectrumLogo";
import { SpectralFlowField } from "../components/SpectralFlowField";
import { SpectrumWordmark } from "../components/SpectrumWordmark";
import { DemoConsoleButton } from "../components/DemoConsoleButton";

interface HomePageProps {
  onEnterConsole: (page?: string) => void;
  threatState?: string;
  riskScore?: number;
  openAlertsCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onEnterConsole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPipelineStep, setSelectedPipelineStep] = useState(2); // Default on 03 Forecast
  const [selectedScenario, setSelectedScenario] = useState<"nominal" | "syn_flood" | "port_sweep" | "exfiltration">("syn_flood");
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [showTechnicalSpec, setShowTechnicalSpec] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `/#${sectionId}`);
    }
  };

  const copyDeployCommand = () => {
    navigator.clipboard.writeText("docker run -d --net=host -v /var/run/pcap:/pcap:ro spectrum/sensor:v2.4 --interface eth0");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // The 5 Core Visual Story Stages: Observe -> Detect -> Forecast -> Explain -> Investigate
  const pipelineStages = [
    {
      step: "01",
      name: "Observe",
      headline: "Line-rate passive network ingress",
      description: "Lossless packet capture via SPAN or TAP mirrors. Decodes flow headers, inter-arrival intervals, and bidirectional entropy without inline latency penalty.",
      tag: "Passive TAP",
      metrics: [
        { label: "Ingress throughput", val: "10 Gbps / port" },
        { label: "Inline latency overhead", val: "0.00 ms (out-of-band)" },
        { label: "Packet drop rate", val: "0.0001% empirical" },
      ],
      deepSpec: "Operates with zero inline risk. Supported interfaces: 10G/25G/40G fiber NICs, Linux AF_PACKET, DPDK zero-copy ring buffers. Extracts 42 flow features per micro-window.",
    },
    {
      step: "02",
      name: "Detect",
      headline: "Continuous behavioral baseline & anomaly scoring",
      description: "Flags subtle deviations before signatures exist. Evaluates micro-burst reconnaissance sweeps, SYN/ACK asymmetry, and beaconing timing jitter.",
      tag: "Unsupervised",
      metrics: [
        { label: "Inference latency", val: "2.4 ms per chunk" },
        { label: "False alarm rate", val: "< 0.08% target" },
        { label: "Feature dimensionality", val: "42 flow attributes" },
      ],
      deepSpec: "Dynamic Gaussian mixture and inter-quartile range thresholds dynamically calibrate circadian day/night traffic variances per IP subnet.",
    },
    {
      step: "03",
      name: "Forecast",
      headline: "Predictive temporal threat horizons",
      description: "A hybrid Markov state transition and Random Forest engine models attack trajectories, projecting risk escalation across +15m, +30m, and +60m horizons.",
      tag: "Temporal ML",
      metrics: [
        { label: "Horizon projection", val: "+15m / +30m / +60m" },
        { label: "Predictive ROC-AUC", val: "94.8% verified" },
        { label: "Confidence bounds", val: "±95% empirical" },
      ],
      deepSpec: "Markov transition matrix models state jumps between Reconnaissance -> Exploitation -> Lateral Probe -> Exfiltration with probabilistic certainty.",
    },
    {
      step: "04",
      name: "Explain",
      headline: "Transparent KernelSHAP mathematical attribution",
      description: "Every forecast provides auditable telemetry evidence. KernelSHAP mathematical values decompose risk calculations into concrete, observable flow features.",
      tag: "Explainable AI",
      metrics: [
        { label: "Attribution engine", val: "KernelSHAP v2.4" },
        { label: "Primary feature drivers", val: "SYN ratio, Entropy, PPS" },
        { label: "Audit compliance", val: "100% transparent" },
      ],
      deepSpec: "Calculates exact game-theoretic Shapley contributions for each flow feature, eliminating black-box AI opacity for federal and enterprise audits.",
    },
    {
      step: "05",
      name: "Investigate",
      headline: "Unified forensic triage & proactive mitigation",
      description: "Equips analysts with an integrated 3-column triage workspace uniting host metadata, raw flow PCAPs, MITRE ATT&CK techniques, and containment playbooks.",
      tag: "Forensic Command",
      metrics: [
        { label: "Triage acceleration", val: "8.4x faster MTTC" },
        { label: "Containment options", val: "BGP RTBH, Subnet ACL" },
        { label: "Dossier export", val: "Executive PDF & JSON" },
      ],
      deepSpec: "Instant pivot to packet dissection, STIX 2.1 threat correlation, and automated BGP Remotely Triggered Blackhole (RTBH) enforcement.",
    },
  ];

  // Scenario Simulator Data for the Product Preview Section
  const scenarioData = {
    nominal: {
      title: "Nominal enterprise baseline",
      ingressRate: "8,420 pkt/s",
      entropy: "0.64",
      synRatio: "0.08",
      anomalyScore: "0.03",
      threatRisk: "6.2%",
      horizonStatus: "Nominal · Baseline stable across all subnets",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shapDrivers: [
        { name: "HTTP/TLS payload entropy", impact: "-0.42", positive: false },
        { name: "Bidirectional flow ratio", impact: "-0.31", positive: false },
        { name: "Port spread uniformity", impact: "-0.28", positive: false },
      ],
      action: "Continuous passive baseline profiling active. All entities within nominal statistical envelope.",
    },
    syn_flood: {
      title: "Volumetric SYN flood saturation",
      ingressRate: "48,920 pkt/s",
      entropy: "0.94",
      synRatio: "0.91",
      anomalyScore: "0.96",
      threatRisk: "88.4%",
      horizonStatus: "Critical · Gateway saturation predicted at +18 min",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      shapDrivers: [
        { name: "SYN / ACK asymmetry ratio (+0.91)", impact: "+0.58", positive: true },
        { name: "Ingress packet surge rate (+48k pps)", impact: "+0.34", positive: true },
        { name: "Single destination port concentration (443)", impact: "+0.22", positive: true },
      ],
      action: "Recommend immediate upstream BGP Remotely Triggered Blackhole (RTBH) on 198.51.100.44.",
    },
    port_sweep: {
      title: "Adversary reconnaissance port sweep",
      ingressRate: "14,200 pkt/s",
      entropy: "0.86",
      synRatio: "0.62",
      anomalyScore: "0.78",
      threatRisk: "64.2%",
      horizonStatus: "Elevated · Lateral probe predicted at +32 min",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      shapDrivers: [
        { name: "Destination port dispersion variance", impact: "+0.45", positive: true },
        { name: "Half-open TCP SYN handshake ratio", impact: "+0.38", positive: true },
        { name: "Inter-packet arrival jitter", impact: "+0.18", positive: true },
      ],
      action: "Tactical quarantine recommended for adversary probe source 185.220.101.5.",
    },
    exfiltration: {
      title: "Encrypted low-frequency exfiltration",
      ingressRate: "11,100 pkt/s",
      entropy: "0.98",
      synRatio: "0.14",
      anomalyScore: "0.82",
      threatRisk: "72.8%",
      horizonStatus: "Elevated · Staging completion at +44 min",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      shapDrivers: [
        { name: "DNS query length & high Shannon entropy", impact: "+0.49", positive: true },
        { name: "Outbound / inbound byte asymmetry", impact: "+0.36", positive: true },
        { name: "Persistent low-frequency beacon interval", impact: "+0.25", positive: true },
      ],
      action: "Isolate endpoint 10.0.1.22 and revoke session tokens across DC domain.",
    },
  };

  const currentScenario = scenarioData[selectedScenario];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] font-sans selection:bg-[#FCE7F3] selection:text-[#BE185D]">
      {/* ========================================================================= */}
      {/* 1. MINIMAL NAVIGATION                                                     */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#F3E8E8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* SPECTRUM Logo & Official Wordmark (Left) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-1.5 rounded-xl bg-white border border-[#F3E8E8] shadow-xs group-hover:border-[#BE185D]/40 transition-colors">
              <SpectrumLogo size={24} />
            </div>
            <div className="flex items-center">
              <SpectrumWordmark size="header" />
            </div>
          </div>

          {/* 3-4 Simple Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#475569]">
            <button
              onClick={() => handleNavClick("problem")}
              className="hover:text-[#BE185D] transition-colors cursor-pointer py-1"
            >
              The Problem
            </button>
            <button
              onClick={() => handleNavClick("approach")}
              className="hover:text-[#BE185D] transition-colors cursor-pointer py-1"
            >
              Approach
            </button>
            <button
              onClick={() => handleNavClick("story")}
              className="hover:text-[#BE185D] transition-colors cursor-pointer py-1"
            >
              The Story
            </button>
            <button
              onClick={() => handleNavClick("preview")}
              className="hover:text-[#BE185D] transition-colors cursor-pointer py-1"
            >
              Demo Console Preview
            </button>
          </nav>

          {/* One Strong CTA (Right) - No Unnecessary Status/Telemetry Pills */}
          <div className="flex items-center gap-3">
            <DemoConsoleButton onClick={() => onEnterConsole()} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-white border border-[#F3E8E8]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#F3E8E8] px-6 py-6 space-y-3 text-xs text-[#475569] shadow-lg">
            <button
              onClick={() => handleNavClick("problem")}
              className="block w-full text-left py-2 hover:text-[#BE185D] font-medium"
            >
              The Problem
            </button>
            <button
              onClick={() => handleNavClick("approach")}
              className="block w-full text-left py-2 hover:text-[#BE185D] font-medium"
            >
              Approach
            </button>
            <button
              onClick={() => handleNavClick("story")}
              className="block w-full text-left py-2 hover:text-[#BE185D] font-medium"
            >
              The 5-Stage Story
            </button>
            <button
              onClick={() => handleNavClick("preview")}
              className="block w-full text-left py-2 hover:text-[#BE185D] font-medium"
            >
              Demo Console Preview
            </button>
            <div className="pt-3 border-t border-[#F3E8E8]">
              <DemoConsoleButton onClick={() => onEnterConsole()} className="w-full" />
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN IMMERSIVE HERO (BALANCED WITHIN FIRST VIEWPORT)             */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 sm:px-6 py-8 sm:py-10">
        {/* Abstract Animated Flowing Spectral Field (Muted, Barely Visible) */}
        <SpectralFlowField />

        {/* Soft Radial Depth Overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(circle_at_center,_rgba(250,248,245,0.3)_0%,_rgba(250,248,245,0.85)_65%,_#FAF8F5_100%)]"
          aria-hidden="true"
        />

        {/* Hero Editorial Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-4 sm:space-y-5">
          {/* Official SPECTRUM Name & Wordmark Typography */}
          <div className="w-full flex justify-center">
            <SpectrumWordmark size="hero" />
          </div>

          {/* Editorial Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl font-normal text-[#0F172A] tracking-tight italic font-serif">
            “See the signal. Predict the threat.”
          </p>

          {/* One Short Supporting Sentence Only */}
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl mx-auto font-normal">
            Continuous behavioral telemetry that forecasts emerging attack trajectories before breach impact, backed by transparent mathematical evidence.
          </p>

          {/* Maximum 2 Clean CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <DemoConsoleButton onClick={() => onEnterConsole()} />

            <button
              onClick={() => handleNavClick("problem")}
              className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#0F172A] border border-[#F3E8E8] hover:border-[#BE185D]/40 text-xs font-medium transition-all cursor-pointer shadow-xs"
            >
              Explore the Story
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE PROBLEM: REACTIVE DEFENSE IS BROKEN                                */}
      {/* ========================================================================= */}
      <section id="problem" className="py-28 px-6 sm:px-8 max-w-7xl mx-auto space-y-16 border-t border-[#F3E8E8]">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-xs font-medium text-[#BE185D]">
            The Problem
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
            Traditional defense tells you what broke.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            By the time signatures match or SIEM queues fill with alerts, attacker lateral traversal has already completed. Security operations have spent two decades trapped in post-breach reality.
          </p>
        </div>

        {/* One Dominant Comparative Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Legacy Reactive Trap */}
          <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-4">
                <div className="text-sm font-bold text-[#64748B] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  Reactive Post-Breach Alerting
                </div>
                <span className="text-xs text-[#94A3B8] font-mono">+4 Hours Signature Lag</span>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Matches static hashes against known vulnerabilities. Incapable of detecting zero-day probe activity, polymorphic beaconing, or sub-threshold volumetric surges until hosts are already encrypted.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8] text-xs text-rose-600 font-medium flex items-center gap-2">
              <span className="text-base font-bold">✕</span>
              <span>Average dwell time before reactive detection: 16 days</span>
            </div>
          </div>

          {/* SPECTRUM Forward Horizon */}
          <div className="bg-white border border-[#FCE7F3] rounded-3xl p-8 sm:p-10 space-y-6 shadow-md ring-1 ring-[#BE185D]/10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#FCE7F3] pb-4">
                <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BE185D]" />
                  SPECTRUM Predictive Foresight
                </div>
                <span className="text-xs text-[#BE185D] font-semibold font-mono">+60m Threat Horizon</span>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Models dynamic packet entropy and inter-arrival intervals continuously. Foresees emerging escalation curves across +15m to +60m early warning windows with verified empirical confidence.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDF2F8] border border-[#FCE7F3] text-xs text-[#BE185D] font-semibold flex items-center gap-2">
              <span className="text-base font-bold">✓</span>
              <span>Proactive containment executed before perimeter impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE SPECTRUM APPROACH: A FORWARD-LOOKING TELEMETRY LAYER               */}
      {/* ========================================================================= */}
      <section id="approach" className="py-28 bg-white/70 border-y border-[#F3E8E8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-xs font-medium text-[#BE185D]">
              The SPECTRUM Approach
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
              A forward-looking telemetry layer.
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Passive TAP ingress captures network behavior without network friction, modeling attacker state transitions up to 60 minutes into the future.
            </p>
          </div>

          {/* One Dominant Architectural Ribbon Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D]">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-[#BE185D]">PILLAR 01</div>
              <h3 className="font-heading text-lg font-bold text-[#0F172A]">
                Passive In-Memory Ingress
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Lossless 10Gbps SPAN/TAP mirror capture decodes raw flow packets with zero latency penalty and zero inline failure risk.
              </p>
            </div>

            <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D]">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-[#BE185D]">PILLAR 02</div>
              <h3 className="font-heading text-lg font-bold text-[#0F172A]">
                Temporal Markov Forecaster
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Hybrid Markov state transitions and Random Forest models project adversary staging trajectories across +15m, +30m, and +60m windows.
              </p>
            </div>

            <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D]">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-[#BE185D]">PILLAR 03</div>
              <h3 className="font-heading text-lg font-bold text-[#0F172A]">
                Deterministic Mitigation
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                KernelSHAP explainability mathematically isolates primary risk drivers, enabling automated BGP blackholing or endpoint isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE 5-STAGE CORE STORY: OBSERVE -> DETECT -> FORECAST -> EXPLAIN -> ...*/}
      {/* ========================================================================= */}
      <section id="story" className="py-28 px-6 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-xs font-medium text-[#BE185D]">
            The 5-Stage Pipeline
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
            Observe → Detect → Forecast → Explain → Investigate
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            A cohesive 5-stage progression from line-rate passive ingress to automated perimeter containment.
          </p>
        </div>

        {/* 5-Stage Interactive Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {pipelineStages.map((stage, idx) => {
            const isSelected = selectedPipelineStep === idx;
            return (
              <button
                key={stage.step}
                onClick={() => setSelectedPipelineStep(idx)}
                className={`p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#BE185D] shadow-md ring-2 ring-[#BE185D]/15"
                    : "bg-white/70 border-[#F3E8E8] hover:border-[#BE185D]/30 text-[#64748B]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={isSelected ? "text-[#BE185D] font-mono font-bold" : "text-[#94A3B8] font-mono"}>
                    {stage.step}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#F3E8E8] text-[#64748B]">
                    {stage.tag}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#0F172A] mt-2 truncate">
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Panel */}
        {pipelineStages[selectedPipelineStep] && (
          <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl font-bold font-mono text-[#BE185D]">
                  {pipelineStages[selectedPipelineStep].step}
                </span>
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {pipelineStages[selectedPipelineStep].headline}
                  </h3>
                  <div className="text-xs text-[#BE185D] font-medium">
                    Stage {pipelineStages[selectedPipelineStep].name} of 05
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                {pipelineStages[selectedPipelineStep].description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => onEnterConsole()}
                  className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Inspect in Demo Console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F472B6]" />
                </button>

                <button
                  onClick={() => setShowTechnicalSpec(!showTechnicalSpec)}
                  className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{showTechnicalSpec ? "Hide technical spec" : "View technical spec"}</span>
                  {showTechnicalSpec ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Optional Deep Engineering Spec Accordion */}
              {showTechnicalSpec && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8] text-xs text-[#475569] space-y-1.5">
                  <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#BE185D]" />
                    <span>Kernel & Protocol Implementation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-5">
                    {pipelineStages[selectedPipelineStep].deepSpec}
                  </p>
                </div>
              )}
            </div>

            {/* Stage Performance Specs */}
            <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-2xl p-6 sm:p-8 space-y-3.5 text-xs shadow-xs">
              <div className="text-[11px] text-[#64748B] border-b border-[#F3E8E8] pb-3 flex justify-between font-semibold">
                <span>Verified Telemetry Specs</span>
                <span className="text-emerald-600 font-mono text-[10px]">Kernel Online</span>
              </div>
              {pipelineStages[selectedPipelineStep].metrics.map((m, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#F3E8E8]/70">
                  <span className="text-[#64748B]">{m.label}</span>
                  <span className="text-[#0F172A] font-mono text-xs font-semibold">{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. PRODUCT PREVIEW: THE ACTUAL SPECTRUM INTERFACE INTRODUCED HERE          */}
      {/* ========================================================================= */}
      <section id="preview" className="py-28 bg-white/70 border-y border-[#F3E8E8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-xs font-medium text-[#BE185D]">
              Demo Console Preview
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
              The Demo Console.
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Designed for high-velocity triage. Live packet streams, Markovian threat escalation envelopes, and KernelSHAP attribution unified into a single high-density command environment.
            </p>
          </div>

          {/* Interactive Scenario Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { id: "syn_flood", label: "Volumetric SYN Flood" },
              { id: "port_sweep", label: "Reconnaissance Port Sweep" },
              { id: "exfiltration", label: "Encrypted Data Exfiltration" },
              { id: "nominal", label: "Nominal Baseline" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  selectedScenario === s.id
                    ? "bg-[#BE185D] text-white border-[#BE185D] font-semibold shadow-sm"
                    : "bg-white text-[#64748B] border-[#F3E8E8] hover:text-[#0F172A] hover:border-[#BE185D]/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* The High-Fidelity Console Preview Card */}
          <div className="bg-white border border-[#F3E8E8] rounded-3xl p-8 sm:p-12 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            {/* Window Chrome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E8E8] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {currentScenario.title}
                  </h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold font-mono border ${currentScenario.badgeColor}`}>
                    {currentScenario.threatRisk} Risk
                  </span>
                </div>
                <div className="text-xs text-[#64748B] flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#BE185D]" />
                  <span>Horizon projection:</span>
                  <span className="text-[#0F172A] font-semibold">{currentScenario.horizonStatus}</span>
                </div>
              </div>

              <button
                onClick={() => onEnterConsole("attack_forecast")}
                className="px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#0F172A] border border-[#F3E8E8] hover:border-[#BE185D]/40 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all shadow-xs"
              >
                <span>Launch Full Demo Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BE185D]" />
              </button>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8]">
                <div className="text-[11px] text-[#64748B]">Ingress Throughput</div>
                <div className="text-xl font-bold text-[#0F172A] mt-1 font-mono">{currentScenario.ingressRate}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8]">
                <div className="text-[11px] text-[#64748B]">Shannon Flow Entropy</div>
                <div className="text-xl font-bold text-[#BE185D] mt-1 font-mono">{currentScenario.entropy}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8]">
                <div className="text-[11px] text-[#64748B]">SYN / ACK Asymmetry</div>
                <div className="text-xl font-bold text-purple-700 mt-1 font-mono">{currentScenario.synRatio}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F3E8E8]">
                <div className="text-[11px] text-[#64748B]">Anomaly Deviation</div>
                <div className="text-xl font-bold text-rose-600 mt-1 font-mono">{currentScenario.anomalyScore}</div>
              </div>
            </div>

            {/* SHAP Attribution Waterfall + Advisory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* SHAP Breakdown */}
              <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#F3E8E8] rounded-2xl p-6 sm:p-8 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#BE185D]" />
                    KernelSHAP Mathematical Feature Drivers
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B]">Audit Ready</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Observable flow metrics contributing to the current temporal risk forecast:
                </p>

                <div className="space-y-3 pt-1">
                  {currentScenario.shapDrivers.map((driver, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#0F172A] font-medium">{driver.name}</span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            driver.positive ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {driver.impact} SHAP
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#F3E8E8]">
                        <div
                          className={`h-full rounded-full ${
                            driver.positive ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.abs(parseFloat(driver.impact)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Containment Playbook Box */}
              <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-xs space-y-5">
                <div>
                  <div className="flex items-center gap-2 border-b border-[#F3E8E8] pb-3 text-[#0F172A] font-bold">
                    <Compass className="w-4 h-4 text-[#BE185D]" />
                    <span>Tactical Mitigation Advisory</span>
                  </div>
                  <p className="text-xs text-[#475569] mt-4 leading-relaxed">
                    {currentScenario.action}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3E8E8]">
                  <button
                    onClick={() => onEnterConsole("investigation")}
                    className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full text-center font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Execute Mitigation in Workspace →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. AIR-GAPPED TRUST & SECURITY SPECS                                      */}
      {/* ========================================================================= */}
      <section id="trust" className="py-28 px-6 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-xs font-medium text-[#BE185D]">
            Enterprise Assurance
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
            Built for air-gapped & high-assurance enclaves.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Defense-grade specifications with zero external cloud dependencies, cryptographic RBAC, and lossless line-rate mirror capture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Guarantees */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div className="p-6 rounded-3xl bg-white border border-[#F3E8E8] space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Non-intrusive SPAN / TAP mirroring</span>
              </div>
              <p className="text-xs text-[#64748B] pl-7 leading-relaxed">
                Zero network inline friction or latency penalty. In the event of daemon restart, production packets flow completely unimpeded.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#F3E8E8] space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#0F172A] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#BE185D]" />
                <span>100% On-premises & air-gapped execution</span>
              </div>
              <p className="text-xs text-[#64748B] pl-7 leading-relaxed">
                All feature extraction, Random Forest inference, and SHAP calculations execute strictly in-memory on customer-owned infrastructure.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#F3E8E8] space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2.5 text-purple-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Granular RBAC & TLP data classification</span>
              </div>
              <p className="text-xs text-[#64748B] pl-7 leading-relaxed">
                Built-in role enforcement (Analyst, Forensic Lead, Admin) and rigorous TLP:RED / AMBER / CLEAR classification for investigative case briefs.
              </p>
            </div>
          </div>

          {/* Right Column: Clean Sample Daemon Terminal Preview */}
          <div className="lg:col-span-6">
            <div className="bg-[#1E293B] border border-[#334155] rounded-3xl overflow-hidden text-xs shadow-md">
              <div className="bg-[#0F172A] px-6 py-4 border-b border-[#334155] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[11px] text-[#94A3B8] font-mono">spectrum-sensor.sh</span>
                </div>
                <button
                  onClick={copyDeployCommand}
                  className="text-[11px] text-[#F472B6] hover:underline flex items-center gap-1 cursor-pointer font-sans font-medium"
                >
                  {copiedCmd ? "Copied" : "Copy command"}
                </button>
              </div>

              <div className="p-6 space-y-2 text-[#94A3B8] font-mono text-[11px] bg-[#1E293B]">
                <div className="text-[#64748B]"># Attach SPECTRUM passive sensor daemon to core SPAN interface:</div>
                <div className="text-white flex items-center gap-2 font-medium">
                  <span className="text-[#F472B6]">$</span>
                  <span>spectrum sensor attach --interface eth0 --rate 10Gbps</span>
                </div>
                <div className="text-emerald-400 pt-1">
                  [+] Ingress sensor calibrated on eth0 (10 Gbps line-rate)
                </div>
                <div className="text-pink-300">
                  [+] Continuous behavioral baselines initialized (126 entities discovered)
                </div>
                <div className="text-purple-300">
                  [+] Temporal attack forecaster active (horizon: +60 min, confidence: 94.8%)
                </div>
                <div className="text-slate-200">
                  [+] Local SOC WebSocket streaming at ws://127.0.0.1:8000/api/ws/soc
                </div>
                <div className="pt-3 text-[10px] text-[#94A3B8] flex items-center gap-2 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Daemon active · PID 4209 · Lossless mirror</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CALL TO ACTION BANNER                                            */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#FFF1F2] via-[#FAF8F5] to-[#FDF2F8] border border-[#FCE7F3] rounded-3xl p-12 sm:p-16 text-center space-y-6 shadow-sm">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
              Anticipate the attack. <br />
              Protect the network.
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Enter the operational command center to inspect real-time packet ingress, evaluate forecast horizons, and execute proactive containment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => onEnterConsole()}
                className="px-7 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>Enter Demo Console</span>
                <ArrowRight className="w-4 h-4 text-[#F472B6]" />
              </button>

              <button
                onClick={() => onEnterConsole("simulation_lab")}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#0F172A] border border-[#F3E8E8] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Simulation Lab</span>
                <Zap className="w-3.5 h-3.5 text-[#BE185D]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. MINIMAL EDITORIAL FOOTER                                               */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#F3E8E8] bg-[#FAF8F5] py-16 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-xs">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg bg-white border border-[#F3E8E8] shadow-xs">
                <SpectrumLogo size={22} />
              </div>
              <SpectrumWordmark size="header" />
            </div>
            <p className="text-xs text-[#64748B] max-w-sm leading-relaxed">
              Autonomous AI Network Security & Attack Forecasting Platform. Unifying behavioral telemetry, temporal threat horizons, and explainable forensic investigation.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] text-[#64748B]">
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#F3E8E8] text-[#0F172A] font-mono font-medium">
                TLP:CLEAR
              </span>
              <span>Platform Specification v2.4.0</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-[#0F172A] tracking-wider uppercase">
              Demo Console
            </div>
            <ul className="space-y-2 text-[#64748B]">
              <li>
                <button onClick={() => onEnterConsole("dashboard")} className="hover:text-[#BE185D] cursor-pointer">
                  Command Center
                </button>
              </li>
              <li>
                <button onClick={() => onEnterConsole("attack_forecast")} className="hover:text-[#BE185D] cursor-pointer">
                  Threat Forecaster
                </button>
              </li>
              <li>
                <button onClick={() => onEnterConsole("investigation")} className="hover:text-[#BE185D] cursor-pointer">
                  Forensic Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onEnterConsole("network_explorer")} className="hover:text-[#BE185D] cursor-pointer">
                  Entity Topology
                </button>
              </li>
              <li>
                <button onClick={() => onEnterConsole("simulation_lab")} className="hover:text-[#BE185D] cursor-pointer">
                  Simulation Bench
                </button>
              </li>
            </ul>
          </div>

          {/* Technology & Protocols */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-[#0F172A] tracking-wider uppercase">
              Engineering Specs
            </div>
            <ul className="space-y-2 text-[#64748B]">
              <li>Random Forest Temporal v2.4</li>
              <li>KernelSHAP Attribution Engine</li>
              <li>Lossless PCAP & Flow Mirrors</li>
              <li>Air-Gapped In-Enclave Inference</li>
              <li>STIX 2.1 & TAXII 2.1 Feeds</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#F3E8E8] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-4">
          <div>
            © {new Date().getFullYear()} SPECTRUM AI Network Security. All rights reserved.
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              System nominal
            </span>
            <span>Build: v2.4-PROD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
