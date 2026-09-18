import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, BigInteger, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    role = Column(String(50), default="analyst", nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class NetworkSource(Base):
    __tablename__ = "network_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)  # 'pcap', 'zeek', 'cicflowmeter', 'live_interface', 'simulation'
    status = Column(String(50), default="active")
    ip_range = Column(String(100), nullable=True)
    config = Column(JSON, default=dict)
    last_heartbeat = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), unique=True, nullable=False, index=True)
    hostname = Column(String(150), nullable=True)
    asset_type = Column(String(50), nullable=False)  # 'web_server', 'database', 'domain_controller', 'firewall', 'workstation', 'gateway'
    criticality = Column(String(20), default="medium")  # 'critical', 'high', 'medium', 'low'
    operating_system = Column(String(100), nullable=True)
    mac_address = Column(String(50), nullable=True)
    open_ports = Column(JSON, default=list)
    vulnerabilities = Column(JSON, default=list)
    risk_score = Column(Float, default=0.0)
    status = Column(String(50), default="healthy")
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)


class TrafficEvent(Base):
    __tablename__ = "traffic_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source_ip = Column(String(45), nullable=False, index=True)
    destination_ip = Column(String(45), nullable=False, index=True)
    protocol = Column(String(20), nullable=False)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    packets = Column(Integer, default=1)
    bytes = Column(BigInteger, default=0)
    tcp_flags = Column(String(50), nullable=True)
    flow_duration = Column(Float, default=0.0)
    risk_level = Column(String(20), default="low")
    risk_score = Column(Float, default=0.0)
    status = Column(String(50), default="allowed")
    is_simulated = Column(Boolean, default=False)


class TrafficFeatures(Base):
    __tablename__ = "traffic_features"

    id = Column(Integer, primary_key=True, index=True)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    packet_rate = Column(Float, nullable=False)
    byte_rate = Column(Float, nullable=False)
    active_connections = Column(Integer, nullable=False)
    failed_connections = Column(Integer, nullable=False)
    unique_src_ips = Column(Integer, nullable=False)
    unique_dst_ips = Column(Integer, nullable=False)
    tcp_udp_ratio = Column(Float, nullable=False)
    syn_ratio = Column(Float, nullable=False)
    rst_ratio = Column(Float, nullable=False)
    port_entropy = Column(Float, nullable=False)
    destination_concentration = Column(Float, nullable=False)
    mean_packet_size = Column(Float, nullable=False)
    std_packet_size = Column(Float, nullable=False)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    current_threat_state = Column(String(50), nullable=False)
    overall_risk_score = Column(Float, nullable=False)
    predicted_attack = Column(String(100), nullable=False)
    attack_probability = Column(Float, nullable=False)
    forecast_horizon_seconds = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=False)
    historical_trend = Column(String(20), default="escalating")
    contributing_features = Column(JSON, nullable=False)
    ai_reasoning = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    is_simulated = Column(Boolean, default=False)


class MitreTechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(String(20), primary_key=True, index=True)
    tactic = Column(String(100), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    detection_guidance = Column(Text, nullable=True)
    mitigation = Column(Text, nullable=True)
    url = Column(String(255), nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(50), unique=True, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String(20), nullable=False)
    status = Column(String(30), default="Open")
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    source_ip = Column(String(45), nullable=True)
    destination_ip = Column(String(45), nullable=True)
    mitre_technique_id = Column(String(20), ForeignKey("mitre_techniques.id"), nullable=True)
    attack_probability = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    assigned_to = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    analyst_notes = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=False)

    mitre_technique = relationship("MitreTechnique", lazy="joined")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(30), default="Open")
    confidence = Column(Float, nullable=False)
    first_detected = Column(DateTime, default=datetime.datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.datetime.utcnow)
    affected_assets = Column(JSON, default=list)
    ai_prediction = Column(String(100), nullable=True)
    mitre_technique_id = Column(String(20), ForeignKey("mitre_techniques.id"), nullable=True)
    recommended_actions = Column(JSON, default=list)
    analyst_notes = Column(Text, nullable=True)
    assigned_analyst = Column(String(100), nullable=True)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    mitre_technique = relationship("MitreTechnique", lazy="joined")
    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    event_time = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=dict)
    created_by = Column(String(100), default="AI_ENGINE")

    incident = relationship("Incident", back_populates="events")


class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_type = Column(String(50), nullable=False)
    value = Column(String(255), unique=True, nullable=False, index=True)
    threat_actor = Column(String(100), nullable=True)
    malware_family = Column(String(100), nullable=True)
    reputation_score = Column(Integer, default=80)
    source_feed = Column(String(100), nullable=True)
    confidence = Column(String(20), default="High")
    description = Column(Text, nullable=True)
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    architecture = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    accuracy = Column(Float, nullable=False)
    precision_score = Column(Float, nullable=False)
    recall_score = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    false_positive_rate = Column(Float, nullable=False)
    detection_latency_ms = Column(Float, nullable=False)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    attack_class = Column(String(50), nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1 = Column(Float, nullable=False)
    support = Column(Integer, nullable=False)
    confusion_matrix = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    username = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="incident")
    generated_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    incident_number = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    metrics = Column(JSON, default=dict)
    file_path = Column(String(255), nullable=True)
