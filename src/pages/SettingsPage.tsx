import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Server,
  Wifi,
  WifiOff,
  Check,
  RefreshCw,
  Info,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useLanguage } from '@/hooks/useLanguage';
import { API_CONFIG } from '@/config/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SettingsPage() {
  const { status: connStatus, isConnected, refetch } = useConnectionStatus();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem('api_base_url') || API_CONFIG.baseUrl
  );
  const [savedUrl, setSavedUrl] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const handleSaveUrl = () => {
    let normalized: string;
    try {
      const parsed = new URL(apiUrl.trim());
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.search || parsed.hash || parsed.username || parsed.password) throw new Error();
      normalized = parsed.toString().replace(/\/$/, '');
    } catch { setTestResult('fail'); return; }
    localStorage.setItem('api_base_url', normalized);
    setApiUrl(normalized);
    queryClient.resetQueries();
    setSavedUrl(true);
    setTimeout(() => setSavedUrl(false), 2000);
    refetch();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = `${apiUrl.trim().replace(/\/$/, '')}/health`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const body = await res.json();
      setTestResult(res.ok && body.status === 'ok' ? 'success' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 p-4 lg:p-6 max-w-5xl"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/25">
          <SettingsIcon className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text">{t('settings.title')}</h1>
          <p className="text-sm text-brand-text-secondary">{t('settings.subtitle')}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: About */}
        <div className="space-y-4">
          {/* About */}
          <motion.div variants={item} className="card">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-brand-text">{t('settings.about')}</h3>
            </div>
            <div className="space-y-1.5 text-xs text-brand-text-secondary">
              <div className="flex justify-between py-1 border-b border-brand-border-subtle/50">
                <span className="text-brand-text-muted">{t('settings.application')}</span>
                <span className="text-brand-text font-medium">GrandPilot v1.0.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border-subtle/50">
                <span className="text-brand-text-muted">{t('settings.platform')}</span>
                <span className="text-brand-text">Grand Mobile Support Hub</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-text-muted">{t('settings.event')}</span>
                <span className="text-brand-text">Decentrathon 6.0</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Backend Connectivity */}
        <div className="space-y-4">
          {/* API URL */}
          <motion.div variants={item} className="card">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-brand-text">{t('settings.apiUrl')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="input-field min-w-0 flex-1 text-xs font-mono py-2"
                />
                <button onClick={handleSaveUrl} className="btn-primary py-2 px-3.5 text-xs">
                  {savedUrl ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> {t('general.saved')}
                    </>
                  ) : (
                    t('general.save')
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  {testing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {t('settings.testConnection')}
                </button>
                {testResult === 'success' && (
                  <span className="badge bg-brand-success/20 text-brand-success text-xs">
                    {t('settings.connectionSuccess')}
                  </span>
                )}
                {testResult === 'fail' && (
                  <span className="badge bg-brand-danger/20 text-brand-danger text-xs">
                    {t('settings.connectionFail')}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Connection Status */}
          <motion.div variants={item}>
            {isConnected ? (
              <div className="card border-brand-success/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-success/15">
                    <Wifi className="h-5 w-5 text-brand-success" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-success">{t('settings.backendConnected')}</h3>
                    <p className="text-xs text-brand-text-muted mt-0.5 font-mono truncate">
                      {apiUrl}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-brand-danger/25 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-danger/15">
                    <WifiOff className="h-5 w-5 text-brand-danger" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-danger">{t('settings.backendDisconnected')}</h3>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {t('settings.standaloneDemo')}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-brand-bg/50 border border-brand-border-subtle p-3 space-y-1.5 text-xs">
                  <p className="font-medium text-brand-text">{t('settings.troubleshooting')}</p>
                  <ul className="space-y-1 text-brand-text-secondary">
                    <li>{t('settings.check1')}</li>
                    <li>{t('settings.check2')}</li>
                    <li>{t('settings.check3')}</li>
                  </ul>
                </div>
                <button
                  onClick={() => refetch()}
                  className="btn-secondary w-full py-2 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {t('settings.retryHealth')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
