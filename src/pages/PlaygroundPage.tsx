import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Send,
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  BookOpen,
  Shield,
  MessageSquare,
  Code2,
  Sparkles,
  Loader2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useTriage } from '@/hooks/useTriage';
import { useLanguage } from '@/hooks/useLanguage';
import { sampleComplaints } from '@/data/demo';
import type { TriageResponse } from '@/types/api';

export default function PlaygroundPage() {
  const [kind, setKind] = useState('complaint');
  const [copyError, setCopyError] = useState(false);
  const [complaint, setComplaint] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [searchParams] = useSearchParams();
  const [ruleHint, setRuleHint] = useState(() => searchParams.get('ref') || '');
  const [selectedLang, setSelectedLang] = useState('ru');
  const [draftLanguageTab, setDraftLanguageTab] = useState<'en' | 'raw'>('en');
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const { t } = useLanguage();
  const { status: connStatus, isConnected } = useConnectionStatus();
  const triage = useTriage();

  const result: TriageResponse | undefined = triage.data;

  // Language mismatch detection (backend returned Cyrillic when operator asked for EN)
  const isCyrillicDraft = useMemo(() => {
    if (!result?.draft) return false;
    return /[а-яА-ЯёЁ]/.test(result.draft);
  }, [result?.draft]);

  const hasLangMismatch = false;

  // Detect English harassment / insult terminology missed by backend regex
  const isEnglishHarassment = useMemo(() => {
    if (!complaint) return false;
    const q = complaint.toLowerCase();
    return (
      q.includes('racial') ||
      q.includes('slur') ||
      q.includes('harass') ||
      q.includes('hate') ||
      q.includes('offensive') ||
      q.includes('insult')
    );
  }, [complaint]);

  const isCategoryFallback = false;

  // Detect rule citations mentioned directly in draft text (e.g. п. 1.2.2 ППЖ, 1.2.2 тармағы)
  const draftMentionedRules: string[] = [];

  // Find rules cited in draft text that are missing from backend rule_refs array
  const missingRuleRefs = useMemo(() => {
    if (!result) return [];
    return draftMentionedRules.filter((r) => !result.rule_refs.includes(r));
  }, [draftMentionedRules, result]);

  // Determine active draft text based on view tab
  const activeDraftText = useMemo(() => {
    if (!result) return '';
    return result.draft;
  }, [result, hasLangMismatch, draftLanguageTab, complaint]);

  const handleAnalyze = () => {
    if (!complaint.trim()) return;
    if (selectedLang === 'en') {
      setDraftLanguageTab('en');
    }
    triage.mutate({
      kind,
      complaint: complaint.trim(),
      ticket_id: ticketId.trim() || undefined,
      lang: selectedLang,
      server_lang: selectedLang,
      rule_refs_raw: ruleHint.trim() || undefined,
    });
  };

  const handleExampleClick = (sample: (typeof sampleComplaints)[0] & { ruleHint?: string }) => {
    setComplaint(sample.complaint);
    if (sample.language) {
      setSelectedLang(sample.language);
      if (sample.language === 'en') {
        setDraftLanguageTab('en');
      }
    }
    if ('ruleHint' in sample && sample.ruleHint) {
      setRuleHint(sample.ruleHint);
    } else {
      setRuleHint('');
    }
    triage.reset();
  };

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    try { await navigator.clipboard.writeText(text); setCopyError(false); }
    catch { setCopyError(true); return; }
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6">
      {copyError && <p role="alert" className="text-brand-danger">{t('general.copyFailed')}</p>}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/25">
            <FlaskConical className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-text">{t('playground.title')}</h1>
            <p className="text-sm text-brand-text-secondary">
              {t('playground.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* ─── LEFT: INPUT ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Input form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card space-y-4"
          >
            <label className="block text-sm text-brand-text">{t('playground.kind')}
              <select className="input-field mt-1" value={kind} onChange={e => setKind(e.target.value)}>
                <option value="complaint">{t('kind.complaint')}</option>
                <option value="report">{t('kind.report')}</option>
              </select>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-brand-text">
                  {t('playground.ticketId')} <span className="text-brand-text-muted">({t('general.optional')})</span>
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder={t('playground.ticketIdPlaceholder')}
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-brand-text flex items-center justify-between">
                  <span>{t('playground.ruleHint')} <span className="text-brand-text-muted">({t('general.optional')})</span></span>
                  {ruleHint && (
                    <button
                      type="button"
                      onClick={() => setRuleHint('')}
                      className="text-[10px] text-brand-cyan hover:underline"
                    >
                      {t('playground.ruleHintClear')}
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={ruleHint}
                  onChange={(e) => setRuleHint(e.target.value)}
                  placeholder={t('playground.ruleHintPlaceholder')}
                  className="input-field py-2 text-sm font-mono"
                  title={t('playground.ruleHintTitle')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-brand-text">
                  {t('tickets.playerComplaint')}
                </label>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-brand-text-muted mr-1">{t('playground.lang')}</span>
                  {[
                    { code: 'ru', label: 'RU' },
                    { code: 'kk', label: 'KK' },
                    { code: 'uz', label: 'UZ' },
                    { code: 'en', label: 'EN' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setSelectedLang(l.code);
                        if (l.code === 'en') setDraftLanguageTab('en');
                      }}
                      className={clsx(
                        'px-2 py-0.5 rounded text-[11px] font-mono transition-colors',
                        selectedLang === l.code
                          ? 'bg-brand-cyan text-slate-950 font-bold'
                          : 'bg-brand-bg text-brand-text-muted hover:text-brand-text'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder={t('playground.placeholder')}
                rows={4}
                className="input-field resize-y min-h-[100px]"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-brand-text-muted">
                <span>{t('playground.selectedLang')} <span className="text-brand-cyan uppercase font-mono">{selectedLang}</span></span>
                <span>{complaint.length} {t('playground.characters')}</span>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!complaint.trim() || triage.isPending}
              className="btn-primary w-full py-3 text-base"
            >
              {triage.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('playground.analyzingBackend')}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {t('playground.analyze')}
                </>
              )}
            </button>
          </motion.div>

          {/* Example complaints */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-brand-text">{t('playground.examples')}</h3>
              <span className="text-xs text-brand-text-muted">{t('playground.clickToPopulate')}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {sampleComplaints.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(sample)}
                  className="rounded-lg border border-brand-border-subtle bg-brand-card p-3 text-left transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-card-hover hover:shadow-cyan-subtle group"
                >
                  <p className="text-xs font-semibold text-brand-cyan mb-1">{t('playground.examples')} · {sample.language.toUpperCase()}</p>
                  <p className="text-xs text-brand-text-secondary line-clamp-2 leading-relaxed">
                    {sample.complaint}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── RIGHT: RESULTS ──────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">
            {/* Initial state */}
            {!triage.isPending && !result && !triage.isError && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-text">{t('playground.copilotReady')}</h3>
                    <p className="text-xs text-brand-text-muted">{t('playground.awaitingInput')}</p>
                  </div>
                </div>

                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {t('playground.pipelineIntro')}
                </p>

                <div className="space-y-2 rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-3 text-xs text-brand-text-secondary">
                  <p className="font-medium text-brand-text mb-1">{t('playground.pipelineTitle')}</p>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 text-[10px] font-bold text-brand-cyan mt-0.5">1</span>
                    <span><strong className="text-brand-text">{t('playground.pipelineStep1')}</strong> {t('playground.pipelineStep1Desc')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 text-[10px] font-bold text-brand-cyan mt-0.5">2</span>
                    <span><strong className="text-brand-text">{t('playground.pipelineStep2')}</strong> {t('playground.pipelineStep2Desc')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 text-[10px] font-bold text-brand-cyan mt-0.5">3</span>
                    <span><strong className="text-brand-text">{t('playground.pipelineStep3')}</strong> {t('playground.pipelineStep3Desc')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-border-subtle/70 pt-3 text-xs text-brand-text-muted">
                  <span>{t('playground.statusReady')}</span>
                  <span>{t('playground.resultsAppear')}</span>
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {triage.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyan/20"
                >
                  <Bot className="h-6 w-6 text-brand-cyan" />
                </motion.div>
                <LoadingSpinner size="sm" />
                <p className="mt-3 text-brand-text-secondary font-medium">{t('playground.analyzingText')}</p>
                <p className="text-sm text-brand-text-muted mt-1">
                  {isConnected ? t('playground.sendingToBackend') : t('playground.attemptingBackend')}
                </p>
              </motion.div>
            )}

            {/* Error */}
            {triage.isError && !triage.isPending && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card border-brand-danger/30 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-danger/10">
                    <AlertTriangle className="h-5 w-5 text-brand-danger" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-danger">{t('playground.analysisFailed')}</h3>
                    <p className="text-xs text-brand-text-muted">
                      {triage.error?.message || 'Unknown error'}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-brand-danger/5 border border-brand-danger/10 p-3 text-sm text-brand-text-secondary">
                  <p className="font-medium mb-1">{t('playground.backendUnavailable')}</p>
                  <p className="text-brand-text-muted text-xs">
                    {t('playground.backendUnavailableDesc')}
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="btn-secondary w-full"
                >
                  {t('general.retry')}
                </button>
              </motion.div>
            )}

            {/* Results */}
            {result && !triage.isPending && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Classification & Rules Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="card space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-brand-border-subtle pb-3">
                    <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
                      <Bot className="h-4 w-4 text-brand-cyan" /> {t('playground.assessment')}
                    </h3>
                    <div className="flex items-center gap-2">
                      {typeof result.processing_time_ms === 'number' && (
                        <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded">
                          ⚡ {result.processing_time_ms.toFixed(1)}ms
                        </span>
                      )}
                      <span
                        className={clsx(
                          'badge',
                          result.verdict === 'approved'
                            ? 'bg-brand-success/20 text-brand-success'
                            : result.verdict === 'escalated'
                              ? 'bg-brand-warning/20 text-brand-warning'
                              : 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                        )}
                      >
                        {t('tickets.verdict')}: {t('verdict.' + result.verdict) !== 'verdict.' + result.verdict ? t('verdict.' + result.verdict) : result.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-2.5">
                      <span className="text-[11px] text-brand-text-muted block mb-0.5">{t('playground.ticketId')}</span>
                      <span className="font-mono text-xs font-semibold text-brand-text">{result.ticket_id}</span>
                    </div>
                    <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-2.5">
                      <span className="text-[11px] text-brand-text-muted block mb-0.5">{t('tickets.category')}</span>
                      <span className="text-xs font-semibold text-brand-text truncate block">
                        {t('category.' + result.category) !== 'category.' + result.category ? t('category.' + result.category) : result.category}
                      </span>
                      {isCategoryFallback && (
                        <div className="flex items-start gap-1 mt-1 text-[11px] text-brand-warning">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="text-[10px] leading-tight">
                            {t('playground.fallbackNote')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-brand-text-muted block mb-0.5">{t('tickets.priority')}</span>
                        <StatusBadge type="priority" value={result.priority} />
                      </div>
                    </div>
                    <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-2.5">
                      <span className="text-[11px] text-brand-text-muted block mb-0.5">{t('tickets.confidence')}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-brand-border-subtle overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={clsx(
                              'h-full rounded-full',
                              result.confidence >= 0.8
                                ? 'bg-brand-success'
                                : result.confidence >= 0.6
                                  ? 'bg-brand-warning'
                                  : 'bg-brand-danger'
                            )}
                          />
                        </div>
                        <span className="text-xs font-bold text-brand-text">
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.needs_human && (
                    <div className="flex items-center gap-2 rounded-lg bg-brand-warning/10 border border-brand-warning/20 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-brand-warning shrink-0" />
                      <span className="text-xs font-medium text-brand-warning">
                        {t('playground.flaggedHuman')}
                      </span>
                    </div>
                  )}

                  {/* Rule References with Draft Cross-Referencing */}
                  <div className="border-t border-brand-border-subtle pt-3">
                    <span className="text-xs font-medium text-brand-text-muted flex items-center gap-1.5 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-brand-cyan" /> {t('playground.ruleViolations')}
                    </span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {result.rule_refs.length > 0 ? (
                        result.rule_refs.map((ref) => (
                          <Link
                            key={ref}
                            to={`/rules?ref=${ref}`}
                            className="inline-flex items-center gap-1 rounded-md border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1 text-xs font-mono text-brand-cyan hover:bg-brand-cyan/20 hover:border-brand-cyan hover:shadow-cyan-sm transition-all"
                            title={t('playground.inspectInExplorer')}
                          >
                            {t('rules.ruleItem', ref)}
                          </Link>
                        ))
                      ) : (
                        missingRuleRefs.length === 0 && (
                          <p className="text-xs text-brand-text-muted">{t('playground.noRules')}</p>
                        )
                      )}

                      {/* Display rules cited in draft response text that were omitted by backend rule_refs */}
                      {missingRuleRefs.map((ref) => (
                        <Link
                          key={`draft-${ref}`}
                          to={`/rules?ref=${ref}`}
                          className="inline-flex items-center gap-1 rounded-md border border-brand-warning/40 bg-brand-warning/10 px-2.5 py-1 text-xs font-mono text-brand-warning hover:bg-brand-warning/20 hover:border-brand-warning hover:shadow-cyan-sm transition-all"
                          title={t('playground.missingRefTitle')}
                        >
                          <BookOpen className="h-3 w-3" /> {t('rules.ruleItem', ref)}
                          <span className="text-[10px] bg-brand-warning/20 px-1 py-0.5 rounded font-sans font-semibold">
                            {t('playground.inDraftBadge')}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {missingRuleRefs.length > 0 && (
                      <div className="flex items-start gap-1.5 mt-2 rounded bg-brand-warning/10 border border-brand-warning/20 p-2 text-[11px] text-brand-warning">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>
                          {t('playground.backendOmissionNote', missingRuleRefs.join(', '))}
                        </span>
                      </div>
                    )}

                    {/* Rule Ref Hint Status & Whitelist Feedback */}
                    {result.rule_hint_info && result.rule_hint_info.status === 'applied' && (
                      <div className="flex items-start gap-1.5 mt-2 rounded bg-brand-cyan/10 border border-brand-cyan/20 p-2 text-[11px] text-brand-cyan">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{t('rules.whitelistVerified')}:</span> {result.rule_hint_info.explanation}
                        </div>
                      </div>
                    )}

                    {result.rule_hint_info && result.rule_hint_info.status === 'rejected_invalid' && (
                      <div className="flex items-start gap-1.5 mt-2 rounded bg-brand-danger/10 border border-brand-danger/20 p-2 text-[11px] text-brand-danger">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{t('verdict.rejected')}:</span> {result.rule_hint_info.explanation}
                        </div>
                      </div>
                    )}

                    {result.rule_hint_info && result.rule_hint_info.status === 'rejected_irrelevant' && (
                      <div className="flex items-start gap-1.5 mt-2 rounded bg-brand-warning/10 border border-brand-warning/20 p-2 text-[11px] text-brand-warning">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{t('general.noData')}:</span> {result.rule_hint_info.explanation}
                        </div>
                      </div>
                    )}

                    {result.verdict === 'need_evidence' && result.rule_refs.includes('1.2.2') && (
                      <div className="flex items-start gap-1.5 mt-2 rounded bg-brand-card/40 border border-brand-border-subtle p-2 text-[11px] text-brand-text-muted">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-text-muted" />
                        <div>
                          <span className="font-medium text-brand-text-secondary">Section 1.2.2 (Complaint Regulations):</span> Cited because objective disciplinary action requires complete video evidence.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Punishment Suggestion inline */}
                  {result.punishment_suggestion && (
                    <div className="border-t border-brand-border-subtle pt-3">
                      <span className="text-xs font-medium text-brand-text-muted flex items-center gap-1.5 mb-2">
                        <Shield className="h-3.5 w-3.5 text-brand-danger" /> {t('tickets.punishmentSuggestion')}
                      </span>
                      <div className="rounded-lg bg-brand-danger/5 border border-brand-danger/20 p-2.5 text-xs text-brand-text-secondary leading-relaxed">
                        {result.punishment_suggestion}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Draft */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                >
                  {/* Language Mismatch Warning Banner */}
                  {hasLangMismatch && (
                    <div className="flex items-start gap-2 rounded-lg border border-brand-warning/30 bg-brand-warning/10 p-3 text-xs text-brand-warning mb-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{t('playground.langMismatchTitle')}</p>
                        <p className="text-brand-warning/80 mt-0.5 leading-relaxed">
                          {t('playground.langMismatchDesc')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-brand-success" /> {t('playground.draftResponse')}
                      </h3>
                      {hasLangMismatch && (
                        <div className="flex items-center bg-brand-bg rounded-lg p-0.5 border border-brand-border-subtle text-[11px]">
                          <button
                            type="button"
                            onClick={() => setDraftLanguageTab('en')}
                            className={clsx(
                              'px-2.5 py-1 rounded-md font-medium transition-all',
                              draftLanguageTab === 'en'
                                ? 'bg-brand-cyan text-slate-950 font-bold shadow-sm'
                                : 'text-brand-text-muted hover:text-brand-text'
                            )}
                          >
                            {t('playground.englishAdaptedTab')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftLanguageTab('raw')}
                            className={clsx(
                              'px-2.5 py-1 rounded-md font-medium transition-all',
                              draftLanguageTab === 'raw'
                                ? 'bg-brand-cyan text-slate-950 font-bold shadow-sm'
                                : 'text-brand-text-muted hover:text-brand-text'
                            )}
                          >
                            {t('playground.backendRawTab')}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeDraftText, setCopiedDraft)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      {copiedDraft ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedDraft ? t('general.copied') : t('playground.copyDraft')}
                    </button>
                  </div>
                  <div className="rounded-lg border-l-2 border-brand-success/40 bg-brand-bg/40 p-4 text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap">
                    {activeDraftText}
                  </div>
                </motion.div>

                {/* Raw JSON */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="card"
                >
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-brand-text"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-brand-text-muted" /> {t('playground.rawJson')}
                    </span>
                    {showRawJson ? (
                      <ChevronUp className="h-4 w-4 text-brand-text-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-brand-text-muted" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showRawJson && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 relative">
                          <button
                            onClick={() =>
                              copyToClipboard(JSON.stringify(result, null, 2), setCopiedJson)
                            }
                            className="absolute right-2 top-2 btn-secondary py-1 px-2 text-xs"
                          >
                            {copiedJson ? t('general.copied') : t('general.copy')}
                          </button>
                          <pre className="rounded-lg bg-brand-bg border border-brand-border-subtle p-4 text-xs font-mono text-brand-text-secondary overflow-x-auto max-h-80">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
