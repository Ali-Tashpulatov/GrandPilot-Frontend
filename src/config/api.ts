export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  endpoints: {
    triage: '/triage',
    health: '/health',
    rulesRefs: '/rules/refs',
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  const base = localStorage.getItem('api_base_url') || API_CONFIG.baseUrl;
  return `${base.replace(/\/$/, '')}${endpoint}`;
};
