// ─── Backend API Types ────────────────────────────────────────────────────────
// Exact contracts matching Grand Mobile FastAPI backend (OpenAPI 3.1.0)

export interface TicketMessage {
  role: string;
  ts?: string;
  text?: string;
}

export interface TriageRequest {
  ticket_id?: string;
  kind?: string;
  created_at?: string;
  region?: string;
  server_lang?: string;
  lang?: string;
  reporter_hash?: string;
  reported_hash?: string;
  reported_nick?: string;
  rule_refs_raw?: string;
  images_count?: number;
  status?: number;
  messages?: TicketMessage[];
  verdict?: string | null;
  punishment?: string | null;
  violation?: string | null;
  // Convenience field for UI consumers passing complaint text
  complaint?: string;
  player_id?: string;
  language?: string;
}

export interface RuleHintInfo {
  hint: string;
  normalized_ref?: string | null;
  status: 'applied' | 'rejected_invalid' | 'rejected_irrelevant' | 'none';
  is_valid: boolean;
  is_relevant: boolean;
  explanation: string;
  rule_title?: string | null;
}

export interface TriageResponse {
  ticket_id: string;
  category: string;
  priority: string;
  rule_refs: string[];
  verdict: string;
  punishment_suggestion: string | null;
  draft: string;
  needs_human: boolean;
  confidence: number;
  processing_time_ms?: number;
  rule_hint_info?: RuleHintInfo | null;
}

export interface HealthResponse {
  status: string;
  service?: string;
}

export interface RulesRefsResponse {
  refs: string[];
}

export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  severity?: string;
  examples?: string[];
}

// ─── Application UI Types ──────────────────────────────────────────────────

export type TicketStatus = 'new' | 'processing' | 'ai_resolved' | 'escalated' | 'closed';
export type Priority = 'p0' | 'p1' | 'p2' | 'p3';

export interface Ticket {
  kind?: 'complaint' | 'report';
  id: string;
  complaint: string;
  player_id?: string;
  language: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  // AI analysis (populated after triage)
  triage?: TriageResponse;
  // Operator actions
  operator_action?: 'approved' | 'edited' | 'escalated';
  operator_notes?: string;
  edited_draft?: string;
}

export interface OperatorProfile {
  name: string;
  role: string;
  avatar?: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

export type SupportedLanguage = 'en' | 'ru' | 'kk' | 'uz';

export interface AppSettings {
  language: SupportedLanguage;
  theme: 'dark' | 'light';
  apiBaseUrl: string;
}
