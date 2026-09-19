const API_BASE = "/api/v1";

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard summary: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchLiveMetrics() {
  const res = await fetch(`${API_BASE}/live/metrics`);
  return res.json();
}

export async function fetchCurrentForecast() {
  const res = await fetch(`${API_BASE}/forecast/current`);
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function updateAlertAction(alertId: number, action: string, note?: string, assignedTo?: string) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, note, assigned_to: assignedTo }),
  });
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  return res.json();
}

export async function addIncidentNote(incidentId: string, note: string) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  return res.json();
}

export async function updateIncidentStatus(incidentId: string, status: string) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchNetworkTopology() {
  const res = await fetch(`${API_BASE}/network/topology`);
  return res.json();
}

export async function fetchAssetDetails(ip: string) {
  const res = await fetch(`${API_BASE}/network/asset/${ip}`);
  return res.json();
}

export async function fetchTrafficEvents(limit: number = 50, protocol?: string, risk?: string, search?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (protocol) params.append("protocol", protocol);
  if (risk) params.append("risk", risk);
  if (search) params.append("search", search);
  const res = await fetch(`${API_BASE}/traffic/events?${params.toString()}`);
  return res.json();
}

export async function uploadTrafficFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/traffic/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchInvestigationCase(targetIp: string = "10.0.1.15") {
  const res = await fetch(`${API_BASE}/investigation/case/${targetIp}`);
  return res.json();
}

export async function fetchThreatIndicators(search?: string) {
  const url = search ? `${API_BASE}/threat-intel/indicators?search=${encodeURIComponent(search)}` : `${API_BASE}/threat-intel/indicators`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchAIInsights() {
  const res = await fetch(`${API_BASE}/ai-insights`);
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/models/metrics`);
  return res.json();
}

export async function fetchExplainability() {
  const res = await fetch(`${API_BASE}/explainability/current`);
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  return res.json();
}

export async function generateReport(title?: string, incidentNumber?: string) {
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, incident_number: incidentNumber }),
  });
  return res.json();
}

export async function fetchSimulationStatus() {
  const res = await fetch(`${API_BASE}/simulation/status`);
  return res.json();
}

export async function setSimulationScenario(scenario: string, speed: number = 1.0) {
  const res = await fetch(`${API_BASE}/simulation/scenario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario, speed }),
  });
  return res.json();
}

export async function stepSimulation() {
  const res = await fetch(`${API_BASE}/simulation/step`, { method: "POST" });
  return res.json();
}

export async function toggleSimulation(start: boolean) {
  const endpoint = start ? "start" : "stop";
  const res = await fetch(`${API_BASE}/simulation/${endpoint}`, { method: "POST" });
  return res.json();
}

export async function escalateAlertToIncident(alertId: number, notes?: string, assignedTo?: string, severity?: string) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes, assigned_to: assignedTo, severity }),
  });
  return res.json();
}

export async function queryInvestigationEvents(params: {
  query?: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
  port?: number;
  min_risk?: number;
  limit?: number;
}) {
  const res = await fetch(`${API_BASE}/investigation/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function setTelemetryMode(mode: string) {
  const res = await fetch(`${API_BASE}/simulation/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  return res.json();
}

export async function fetchSystemHealth() {
  const res = await fetch(`${API_BASE}/system/health`);
  return res.json();
}
