-- SPECTRUM Enterprise SOC Database Schema (PostgreSQL DDL)
-- AI-Powered Network Attack Forecasting & Security Operations Platform

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS network_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    ip_range VARCHAR(100),
    config JSONB DEFAULT '{}'::jsonb,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    hostname VARCHAR(150),
    asset_type VARCHAR(50) NOT NULL,
    criticality VARCHAR(20) DEFAULT 'medium',
    operating_system VARCHAR(100),
    mac_address VARCHAR(50),
    open_ports JSONB DEFAULT '[]'::jsonb,
    vulnerabilities JSONB DEFAULT '[]'::jsonb,
    risk_score FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'healthy',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS traffic_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    source_port INTEGER,
    destination_port INTEGER,
    packets INTEGER DEFAULT 1,
    bytes BIGINT DEFAULT 0,
    tcp_flags VARCHAR(50),
    flow_duration FLOAT DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'low',
    risk_score FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'allowed',
    is_simulated BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_traffic_timestamp ON traffic_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_src_ip ON traffic_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_traffic_dst_ip ON traffic_events(destination_ip);

CREATE TABLE IF NOT EXISTS traffic_features (
    id SERIAL PRIMARY KEY,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    packet_rate FLOAT NOT NULL,
    byte_rate FLOAT NOT NULL,
    active_connections INTEGER NOT NULL,
    failed_connections INTEGER NOT NULL,
    unique_src_ips INTEGER NOT NULL,
    unique_dst_ips INTEGER NOT NULL,
    tcp_udp_ratio FLOAT NOT NULL,
    syn_ratio FLOAT NOT NULL,
    rst_ratio FLOAT NOT NULL,
    port_entropy FLOAT NOT NULL,
    destination_concentration FLOAT NOT NULL,
    mean_packet_size FLOAT NOT NULL,
    std_packet_size FLOAT NOT NULL,
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_threat_state VARCHAR(50) NOT NULL,
    overall_risk_score FLOAT NOT NULL,
    predicted_attack VARCHAR(100) NOT NULL,
    attack_probability FLOAT NOT NULL,
    forecast_horizon_seconds INTEGER NOT NULL,
    confidence_score FLOAT NOT NULL,
    historical_trend VARCHAR(20) DEFAULT 'escalating',
    contributing_features JSONB NOT NULL,
    ai_reasoning TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    is_simulated BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS mitre_techniques (
    id VARCHAR(20) PRIMARY KEY,
    tactic VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    detection_guidance TEXT,
    mitigation TEXT,
    url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_code VARCHAR(50) UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'Open',
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    mitre_technique_id VARCHAR(20) REFERENCES mitre_techniques(id),
    attack_probability FLOAT,
    confidence FLOAT,
    assigned_to VARCHAR(100),
    description TEXT,
    analyst_notes TEXT,
    is_simulated BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'Open',
    confidence FLOAT NOT NULL,
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    affected_assets JSONB DEFAULT '[]'::jsonb,
    ai_prediction VARCHAR(100),
    mitre_technique_id VARCHAR(20) REFERENCES mitre_techniques(id),
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    analyst_notes TEXT,
    assigned_analyst VARCHAR(100),
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incident_events (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    created_by VARCHAR(100) DEFAULT 'AI_ENGINE'
);

CREATE TABLE IF NOT EXISTS threat_indicators (
    id SERIAL PRIMARY KEY,
    indicator_type VARCHAR(50) NOT NULL,
    value VARCHAR(255) UNIQUE NOT NULL,
    threat_actor VARCHAR(100),
    malware_family VARCHAR(100),
    reputation_score INTEGER DEFAULT 80,
    source_feed VARCHAR(100),
    confidence VARCHAR(20) DEFAULT 'High',
    description TEXT,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    architecture VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    accuracy FLOAT NOT NULL,
    precision_score FLOAT NOT NULL,
    recall_score FLOAT NOT NULL,
    f1_score FLOAT NOT NULL,
    roc_auc FLOAT NOT NULL,
    false_positive_rate FLOAT NOT NULL,
    detection_latency_ms FLOAT NOT NULL,
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_metrics (
    id SERIAL PRIMARY KEY,
    model_version_id INTEGER REFERENCES model_versions(id),
    attack_class VARCHAR(50) NOT NULL,
    precision FLOAT NOT NULL,
    recall FLOAT NOT NULL,
    f1 FLOAT NOT NULL,
    support INTEGER NOT NULL,
    confusion_matrix JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'incident',
    generated_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    incident_number VARCHAR(50),
    summary TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    file_path VARCHAR(255)
);
