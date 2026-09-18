import React, { useState, useEffect } from "react";
import { GlobalRail, PrimaryModule } from "./components/GlobalRail";
import { ContextualNav } from "./components/ContextualNav";
import { Header } from "./components/Header";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { WorkspaceSubHeader } from "./components/WorkspaceSubHeader";
import { MobileNavDrawer } from "./components/MobileNavDrawer";

// Pages & Workspaces
import { HomePage } from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { AttackForecast } from "./pages/AttackForecast";
import { Alerts } from "./pages/Alerts";
import { Incidents } from "./pages/Incidents";
import { MitreAttack } from "./pages/MitreAttack";
import { AIInsights } from "./pages/AIInsights";
import { Investigation } from "./pages/Investigation";
import { Reports } from "./pages/Reports";
import { NetworkExplorer } from "./pages/NetworkExplorer";
import { LiveMonitor } from "./pages/LiveMonitor";
import { TrafficAnalysis } from "./pages/TrafficAnalysis";
import { SimulationLab } from "./pages/SimulationLab";
import { ModelPerformance } from "./pages/ModelPerformance";
import { DataSources } from "./pages/DataSources";
import { SystemHealth } from "./pages/SystemHealth";
import { UsersRoles } from "./pages/UsersRoles";
import { Settings } from "./pages/Settings";

import { socWebSocket } from "./services/websocket";
import { fetchSimulationStatus, fetchAlerts } from "./services/api";

const PAGE_TO_MODULE: Record<string, PrimaryModule> = {
  dashboard: "overview",

  attack_forecast: "detection",
  alerts: "detection",
  incidents: "detection",
  mitre_attack: "detection",
  ai_insights: "detection",
  threat_intel: "detection",

  investigation: "investigation",
  reports: "investigation",
  export_center: "investigation",

  network_explorer: "monitoring",
  live_monitor: "monitoring",
  traffic_analysis: "monitoring",

  simulation_lab: "settings",
  model_performance: "settings",
  data_sources: "settings",
  system_health: "settings",
  users_roles: "settings",
  settings: "settings",
};

const MODULE_DEFAULT_PAGE: Record<PrimaryModule, string> = {
  overview: "dashboard",
  detection: "attack_forecast",
  investigation: "investigation",
  monitoring: "network_explorer",
  settings: "simulation_lab",
};

export const App: React.FC = () => {
  // Routing: "public" (Home page) vs "app" (Console)
  const [viewMode, setViewMode] = useState<"public" | "app">(() => {
    const path = window.location.pathname;
    return path.startsWith("/app") ? "app" : "public";
  });

  const [activeModule, setActiveModule] = useState<PrimaryModule>("overview");
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [isContextualNavOpen, setIsContextualNavOpen] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const [threatState, setThreatState] = useState<string>("Normal");
  const [riskScore, setRiskScore] = useState<number>(7.4);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(1);
  const [activeScenario, setActiveScenario] = useState<string>("Normal");
  const [telemetryMode, setTelemetryMode] = useState<string>("simulation");
  const [pivotParams, setPivotParams] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Initialize page/module from path if on /app/*
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/app")) {
      const parts = path.split("/").filter(Boolean);
      if (parts.length > 1) {
        const sub = parts[1];
        if (PAGE_TO_MODULE[sub]) {
          setActivePage(sub);
          setActiveModule(PAGE_TO_MODULE[sub]);
        } else if (MODULE_DEFAULT_PAGE[sub as PrimaryModule]) {
          setActiveModule(sub as PrimaryModule);
          setActivePage(MODULE_DEFAULT_PAGE[sub as PrimaryModule]);
        }
      }
    }
  }, []);

  // Sync document title to reflect SPECTRUM Demo Console
  useEffect(() => {
    if (viewMode === "public") {
      document.title = "SPECTRUM | AI Network Security & Attack Forecasting Platform";
    } else {
      const pageNames: Record<string, string> = {
        dashboard: "Command Center",
        attack_forecast: "Threat Forecaster",
        alerts: "Security Alerts",
        incidents: "Incidents",
        mitre_attack: "MITRE ATT&CK",
        ai_insights: "AI Insights",
        threat_intel: "Threat Intelligence",
        investigation: "Forensics & Investigation",
        reports: "Audit Reports",
        network_explorer: "Network Explorer",
        live_monitor: "Live Traffic Monitor",
        traffic_analysis: "Traffic Analysis",
        simulation_lab: "Simulation Lab",
        model_performance: "Model Performance",
        data_sources: "Network Sensors",
        system_health: "System Diagnostics",
        users_roles: "User Access",
        settings: "Platform Settings",
      };
      const subTitle = pageNames[activePage] || "Workspace";
      document.title = `SPECTRUM Demo Console | ${subTitle}`;
    }
  }, [viewMode, activePage]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith("/app")) {
        setViewMode("app");
        const parts = path.split("/").filter(Boolean);
        if (parts.length > 1) {
          const sub = parts[1];
          if (PAGE_TO_MODULE[sub]) {
            setActivePage(sub);
            setActiveModule(PAGE_TO_MODULE[sub]);
          } else if (MODULE_DEFAULT_PAGE[sub as PrimaryModule]) {
            setActiveModule(sub as PrimaryModule);
            setActivePage(MODULE_DEFAULT_PAGE[sub as PrimaryModule]);
          }
        } else {
          setActivePage("dashboard");
          setActiveModule("overview");
        }
      } else {
        setViewMode("public");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToConsole = (targetPage?: string) => {
    setViewMode("app");
    if (targetPage) {
      handleSelectPage(targetPage);
    } else {
      handleSelectPage("dashboard");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToPublic = () => {
    setViewMode("public");
    window.history.pushState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectModule = (mod: PrimaryModule) => {
    setActiveModule(mod);
    const defPage = MODULE_DEFAULT_PAGE[mod];
    setActivePage(defPage);
    window.history.pushState(null, "", `/app/${defPage}`);
  };

  const handleSelectPage = (page: string) => {
    setActivePage(page);
    const parentModule = PAGE_TO_MODULE[page];
    if (parentModule) {
      setActiveModule(parentModule);
    }
    window.history.pushState(null, "", `/app/${page}`);
  };

  const navigateWithPivot = (page: string, params?: any) => {
    setPivotParams(params || null);
    handleSelectPage(page);
  };

  useEffect(() => {
    // Initial status fetch
    fetchSimulationStatus().then((res) => {
      if (res.mode) setTelemetryMode(res.mode);
      if (res.active_scenario) setActiveScenario(res.active_scenario);
      if (res.forecast) {
        setThreatState(res.forecast.current_threat_state || "Normal");
        setRiskScore(res.forecast.overall_risk_score || 7.4);
      }
    });

    fetchAlerts().then((res) => {
      if (Array.isArray(res)) {
        setOpenAlertsCount(res.filter((a) => a.status === "Open" || a.status === "NEW").length);
      }
    });

    // Subscribe to live WebSocket events
    const unsubscribe = socWebSocket.subscribe((msg) => {
      if (msg.mode) setTelemetryMode(msg.mode);
      if (msg.scenario) setActiveScenario(msg.scenario);
      if (msg.forecast) {
        setThreatState(msg.forecast.current_threat_state || "Normal");
        setRiskScore(msg.forecast.overall_risk_score || 7.4);
      }
      if (msg.active_alerts_count !== undefined) {
        setOpenAlertsCount(msg.active_alerts_count);
      }
    });

    // Global keyboard shortcuts (Ctrl+K, ?, [, and G-prefixed navigation)
    let lastKey = "";
    let keyTimeout: ReturnType<typeof setTimeout> | number | null = null;

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      if (e.key === "[" && !e.ctrlKey && !e.metaKey && viewMode === "app") {
        e.preventDefault();
        setIsContextualNavOpen((prev) => !prev);
        return;
      }

      if (viewMode === "app") {
        const currentKey = e.key.toLowerCase();
        if (lastKey === "g") {
          const keyPageMap: Record<string, string> = {
            d: "dashboard",
            f: "attack_forecast",
            a: "alerts",
            i: "incidents",
            m: "mitre_attack",
            w: "investigation",
            r: "reports",
            n: "network_explorer",
            l: "live_monitor",
            t: "traffic_analysis",
            s: "simulation_lab",
            h: "system_health",
            p: "settings",
          };

          if (keyPageMap[currentKey]) {
            e.preventDefault();
            handleSelectPage(keyPageMap[currentKey]);
          }

          lastKey = "";
          if (keyTimeout) clearTimeout(keyTimeout);
        } else if (currentKey === "g") {
          lastKey = "g";
          if (keyTimeout) clearTimeout(keyTimeout);
          keyTimeout = setTimeout(() => {
            lastKey = "";
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKey);

    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleGlobalKey);
      if (keyTimeout) clearTimeout(keyTimeout);
    };
  }, [viewMode]);

  const renderPageContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={handleSelectPage} navigateWithPivot={navigateWithPivot} />;

      // 1. Detection & Predictive AI
      case "attack_forecast":
        return <AttackForecast setActivePage={handleSelectPage} />;
      case "alerts":
        return <Alerts navigateWithPivot={navigateWithPivot} />;
      case "incidents":
        return <Incidents pivotParams={pivotParams} navigateWithPivot={navigateWithPivot} />;
      case "mitre_attack":
        return <MitreAttack />;
      case "ai_insights":
      case "threat_intel":
      case "explainability":
        return <AIInsights />;

      // 2. Forensics & Investigation
      case "investigation":
        return <Investigation pivotParams={pivotParams} />;
      case "reports":
      case "export_center":
        return <Reports />;

      // 3. Network & Telemetry
      case "network_explorer":
        return <NetworkExplorer navigateWithPivot={navigateWithPivot} />;
      case "live_monitor":
        return <LiveMonitor />;
      case "traffic_analysis":
        return <TrafficAnalysis />;

      // 4. Simulation Lab & Platform Settings
      case "simulation_lab":
        return <SimulationLab setActivePage={handleSelectPage} />;
      case "model_performance":
        return <ModelPerformance />;
      case "data_sources":
        return <DataSources />;
      case "system_health":
        return <SystemHealth />;
      case "users_roles":
        return <UsersRoles />;
      case "settings":
      default:
        return <Settings initialTab="configuration" setActivePage={handleSelectPage} hideTabs={true} />;
    }
  };

  // 1. PUBLIC PRODUCT SITE VIEW
  if (viewMode === "public") {
    return (
      <HomePage
        onEnterConsole={navigateToConsole}
        threatState={threatState}
        riskScore={riskScore}
        openAlertsCount={openAlertsCount}
      />
    );
  }

  // 2. CORE APPLICATION DEMO CONSOLE VIEW
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] flex select-text font-sans">
      {/* 1. Ultra-Compact 56px Global Icon Rail (Visible on md+) */}
      <GlobalRail
        activeModule={activeModule}
        setActiveModule={handleSelectModule}
        openAlertsCount={openAlertsCount}
        activeScenario={activeScenario}
        isContextualNavOpen={isContextualNavOpen}
        onToggleContextualNav={() => setIsContextualNavOpen((prev) => !prev)}
        onNavigateToPublic={navigateToPublic}
      />

      {/* 2. Secondary 208px Contextual Sub-Navigation (Visible on md+) */}
      <ContextualNav
        activeModule={activeModule}
        activePage={activePage}
        setActivePage={handleSelectPage}
        openAlertsCount={openAlertsCount}
        isOpen={isContextualNavOpen}
      />

      {/* 3. Top Persistent Utility Header */}
      <Header
        activePage={activePage}
        activeModule={activeModule}
        openAlertsCount={openAlertsCount}
        activeScenario={activeScenario}
        telemetryMode={telemetryMode}
        isContextualNavOpen={isContextualNavOpen}
        onOpenGlobalSearch={() => setShowSearchModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onPivotToPage={handleSelectPage}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onNavigateToPublic={navigateToPublic}
      />

      {/* 4. Large Analytical Main Workspace */}
      <main
        className={`mt-14 p-3 sm:p-5 flex-1 min-w-0 overflow-x-hidden transition-all duration-150 ml-0 md:ml-14 ${
          isContextualNavOpen ? "lg:ml-[264px]" : "lg:ml-14"
        }`}
      >
        {/* Workspace Quick Sub-Header Ribbon (Sibling pill navigation & fast actions) */}
        <WorkspaceSubHeader
          activeModule={activeModule}
          activePage={activePage}
          setActivePage={handleSelectPage}
          openAlertsCount={openAlertsCount}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
        />

        {renderPageContent()}
      </main>

      {/* 5. Mobile Navigation Slide-Over Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeModule={activeModule}
        activePage={activePage}
        setActiveModule={handleSelectModule}
        setActivePage={handleSelectPage}
        openAlertsCount={openAlertsCount}
        activeScenario={activeScenario}
        onNavigateToPublic={navigateToPublic}
        onOpenSearch={() => setShowSearchModal(true)}
      />

      {/* 6. Universal Command Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        setActivePage={handleSelectPage}
      />

      {/* 7. Keyboard Shortcuts Help Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
};

export default App;
