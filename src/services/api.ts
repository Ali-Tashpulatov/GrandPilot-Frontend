import { API_CONFIG, getApiUrl } from '@/config/api';
import type {
  TriageRequest,
  TriageResponse,
  HealthResponse,
  RulesRefsResponse,
  TicketMessage,
  Rule,
} from '@/types/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorBody: unknown = '';
      try {
        errorBody = await response.clone().json();
      } catch {
        errorBody = await response.text().catch(() => '');
      }

      // Format FastAPI 422 validation errors nicely if present
      let message = `API request failed: ${response.status} ${response.statusText}`;
      if (
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'detail' in errorBody &&
        Array.isArray((errorBody as { detail: unknown }).detail)
      ) {
        const details = (errorBody as { detail: Array<{ msg?: string; loc?: string[] }> }).detail;
        const formatted = details
          .map((d) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || ''}`)
          .join(', ');
        message = `Validation Error (422): ${formatted}`;
      } else if (typeof errorBody === 'object' && errorBody !== null && 'detail' in errorBody && typeof errorBody.detail === 'string') {
        message = errorBody.detail;
      } else if (typeof errorBody === 'string' && errorBody.length > 0) {
        message = errorBody;
      }

      throw new ApiError(message, response.status, errorBody);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out after 30s. The backend may be busy or unavailable.');
    }
    const targetUrl = getApiUrl('');
    throw new ApiError(
      `Cannot connect to backend at ${targetUrl}. Ensure the FastAPI server is running and accessible (check CORS settings if browsing from a different host).`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const api = {
  /** POST /triage — Submit a complaint for AI analysis */
  async triage(data: TriageRequest): Promise<TriageResponse> {
    // Construct exact payload required by FastAPI schema
    const messages: TicketMessage[] =
      data.messages && data.messages.length > 0
        ? data.messages
        : [
            {
              role: 'player',
              text: data.complaint || '',
              ts: data.created_at || new Date().toISOString(),
            },
          ];

    // Auto-extract reported nickname from complaint if not explicitly passed
    let reportedNick = data.reported_nick;
    if (!reportedNick && data.complaint) {
      const match =
        data.complaint.match(/(?:player|игрок|ойыншы|o'yinchi)\s*["«]([^"»]+)["»]/i) ||
        data.complaint.match(/["«]([A-Za-z0-9_]{3,24})["»]/);
      if (match) {
        reportedNick = match[1];
      }
    }

    const effectiveLang = data.lang || data.language || 'ru';

    const payload: Record<string, unknown> = {
      ticket_id: data.ticket_id || `TKT-${crypto.randomUUID()}`,
      kind: data.kind || 'complaint',
      created_at: data.created_at || new Date().toISOString(),
      lang: effectiveLang,
      server_lang: data.server_lang || effectiveLang,
      messages,
      images_count: data.images_count ?? 0,
      status: data.status ?? 0,
    };

    if (reportedNick) {
      payload.reported_nick = reportedNick;
    }
    if (data.region) payload.region = data.region;
    if (data.reporter_hash) payload.reporter_hash = data.reporter_hash;
    if (data.reported_hash) payload.reported_hash = data.reported_hash;
    if (data.rule_refs_raw) payload.rule_refs_raw = data.rule_refs_raw;

    return request<TriageResponse>(API_CONFIG.endpoints.triage, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** GET /health — Check backend connectivity */
  async healthCheck(): Promise<HealthResponse> {
    const result = await request<HealthResponse>(API_CONFIG.endpoints.health);
    if (result.status !== 'ok') throw new ApiError('Invalid health response');
    return result;
  },

  /** GET /rules/refs — Fetch official rule reference whitelist */
  async getRuleRefs(): Promise<RulesRefsResponse> {
    return request<RulesRefsResponse>(API_CONFIG.endpoints.rulesRefs);
  },

  /** Backward-compatible helper that adapts rule references into structured cards without assuming full descriptions */
  async getRules(): Promise<Rule[]> {
    const res = await this.getRuleRefs();
    const refs = res.refs || [];

    return refs.map((ref) => ({
      id: ref,
      category: '',
      title: `Rule Clause ${ref}`,
      description: `Official Grand Mobile regulation clause ${ref} registered in the server rules whitelist.`,
    }));
  },
};

export { ApiError };
export default api;
