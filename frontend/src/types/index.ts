export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Alert {
  id: number;
  rule_name: string;
  severity: string;
  status: string;
  description: string;
  timestamp: string;
  log_id?: number;
}

export interface LogEntry {
  id: number;
  source_ip: string;
  dest_ip?: string;
  port?: number;
  log_type: string;
  severity: string;
  timestamp: string;
  is_anomaly: boolean;
  anomaly_score?: number;
  raw_data: string;
}

export interface DashboardStats {
  total_logs_24h: number;
  total_alerts_24h: number;
  critical_alerts_total: number;
  active_threats: number;
}
