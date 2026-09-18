export interface KPIs {
  network_health_percent: number;
  current_threat_level: string;
  overall_attack_risk: number;
  active_incidents: number;
  events_per_minute: number;
  model_confidence: number;
  forecast_horizon_seconds: number;
  predicted_attack: string;
  is_simulated: boolean;
}

export interface TrafficEvent {
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  source_port?: number;
  destination_port?: number;
  packets: number;
  bytes: number;
  packets_per_sec?: number;
  bytes_per_sec?: number;
  anomaly_score?: number;
  tcp_flags?: string;
  flow_duration?: number;
  risk_level: string;
  risk_score: number;
  status: string;
  is_simulated: boolean;
}

export interface ContributingFeature {
  feature: string;
  weight: number;
  impact_percent: number;
}

export interface ForecastData {
  attack_risk_percentage: number;
  current_threat_state: string;
  predicted_attack: string;
  forecast_horizon_seconds: number;
  confidence_score: number;
  historical_trend: string;
  current_traffic_state: {
    packet_rate: number;
    byte_rate: number;
    active_connections: number;
    syn_ratio: number;
    rst_ratio: number;
    port_entropy: number;
    destination_concentration: number;
  };
  contributing_features: ContributingFeature[];
  feature_radar: Array<{ subject: string; value: number; baseline: number }>;
  horizon_timeline: Array<{ offset: string; predicted_risk: number }>;
  all_class_probabilities: Record<string, number>;
  ai_reasoning: string;
  recommended_action: string;
  is_simulated: boolean;
}

export interface AlertItem {
  id: number;
  alert_code?: string;
  alert_id?: string;
  timestamp?: string;
  created_at?: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Acknowledged" | "Investigating" | "Resolved" | "NEW" | "INVESTIGATING" | "ACKNOWLEDGED" | "RESOLVED";
  title: string;
  category: string;
  source_ip?: string;
  destination_ip?: string;
  source?: string;
  target?: string;
  mitre_technique_id?: string;
  attack_probability?: number;
  confidence?: number;
  confidence_score?: number;
  assigned_to?: string;
  assigned?: string;
  description?: string;
  analyst_notes?: string;
  is_simulated?: boolean;
}

export interface IncidentItem {
  id: number;
  incident_number: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Contained" | "Resolved";
  confidence: number;
  first_detected: string;
  last_activity: string;
  affected_assets: string[];
  ai_prediction: string;
  mitre_technique_id: string;
  recommended_actions: string[];
  analyst_notes?: string;
  assigned_analyst?: string;
  is_simulated?: boolean;
  timeline?: Array<{ time: string; event: string }>;
}

export interface TopologyNode {
  id: string;
  label: string;
  name?: string;
  ip: string;
  type: "server" | "firewall" | "switch" | "workstation" | "database" | "domain_controller" | "external_threat";
  zone: string;
  status: "healthy" | "active" | "under_attack" | "malicious";
  risk: number;
  risk_score?: number;
  ports: number[];
  traffic_mb: number;
  active_connections?: number;
}

export interface TopologyEdge {
  from: string;
  to: string;
  protocol: string;
  status: string;
  packets: number;
}

export interface SHAPWaterfallItem {
  feature?: string;
  feature_name?: string;
  shap_value: number;
  cumulative_value?: number;
  evidence?: string;
  direction?: "increases_risk" | "decreases_risk";
  actual_value?: string;
}

export interface ExplainabilityData {
  prediction: string;
  confidence: number;
  base_value: number;
  predicted_risk_value: number;
  waterfall: SHAPWaterfallItem[];
  global_importance: Array<{ feature: string; importance: number; category: string }>;
  plain_language_explanation: string;
  is_simulated: boolean;
}

export interface SimulationStatus {
  is_running: boolean;
  active_scenario: string;
  speed: number;
  step_count: number;
  live_stats: {
    packets_per_sec: number;
    bytes_per_sec: number;
    active_connections: number;
    unique_source_ips: number;
    unique_destination_ips: number;
    tcp_udp_ratio: number;
    failed_connections: number;
    port_scanning_events: number;
    anomaly_score: number;
  };
  forecast: any;
  is_simulated: boolean;
}
