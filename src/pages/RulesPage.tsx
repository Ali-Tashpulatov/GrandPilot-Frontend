import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, ChevronRight, AlertCircle, Tag, Shield, ArrowLeft, FlaskConical } from 'lucide-react';
import clsx from 'clsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useRules } from '@/hooks/useRules';
import { useLanguage } from '@/hooks/useLanguage';
import type { Rule } from '@/types/api';

export default function RulesPage() {
  const { data: rules, isLoading, isError, refetch } = useRules();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setSelectedRuleId(refParam);
    }
  }, [searchParams]);

  const ruleList: Rule[] = rules || [];
  const categories = useMemo(
    () => ['all', ...new Set(ruleList.map((r) => r.category).filter(Boolean))],
    [ruleList]
  );

  const filteredRules = useMemo(() => {
    return ruleList.filter((r) => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ruleList, searchQuery, selectedCategory]);

  const selectedRule = ruleList.find((r) => r.id === selectedRuleId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/25">
            <BookOpen className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-text">{t('rules.title')}</h1>
            <p className="text-sm text-brand-text-secondary">{t('rules.refsOnly')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
            {ruleList.length > 0 ? t('rules.ruleCount', filteredRules.length, ruleList.length) : t('rules.zeroRules')}
          </span>
          {isError && (
            <span className="badge bg-brand-danger/15 text-brand-danger border border-brand-danger/20">
              {t('rules.offline')}
            </span>
          )}
        </div>
      </motion.div>

      <button className="btn-secondary" onClick={() => refetch()}>{t('general.retry')}</button>
      {/* Search and Filters Toolbar */}
      <div className="card p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('rules.searchPlaceholder')}
              className="input-field pl-9 py-2 text-sm"
              disabled={ruleList.length === 0}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-brand-text-muted mr-1">{t('rules.categories')}</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              disabled={ruleList.length === 0}
              className={clsx(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                selectedCategory === cat
                  ? 'bg-brand-cyan text-slate-950 font-semibold shadow-cyan-sm'
                  : 'bg-brand-bg/60 text-brand-text-muted hover:text-brand-cyan hover:bg-brand-bg'
              )}
            >
              {cat === 'all'
                ? t('rules.allRules')
                : t('rules.cat.' + cat) !== 'rules.cat.' + cat
                  ? t('rules.cat.' + cat)
                  : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {ruleList.length === 0 ? (
        /* Compact, Attractive Empty State */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col md:flex-row items-center justify-between gap-4 p-5"
        >
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-brand-text">{t('rules.noRulesLoaded')}</h3>
              <p className="text-sm text-brand-text-secondary mt-0.5 max-w-xl">
                {t('rules.noRulesLoadedDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-brand-bg/50 border border-brand-border-subtle px-3 py-2 shrink-0 text-xs">
            <AlertCircle className="h-4 w-4 text-brand-cyan" />
            <span className="font-mono text-brand-text-muted">GET /rules/refs</span>
            <span className="text-brand-text-secondary">{t(isError ? 'general.disconnected' : 'general.connected')}</span>
          </div>
        </motion.div>
      ) : (
        /* Responsive Rules Master-Detail Layout */
        <div className="card p-0 overflow-hidden border border-brand-border-subtle flex flex-col lg:flex-row min-h-[500px]">
          {/* Rules List Column */}
          <div
            className={clsx(
              'w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-brand-border-subtle',
              selectedRule && 'hidden lg:flex'
            )}
          >
            <div className="p-3 border-b border-brand-border-subtle bg-brand-bg/20 text-xs font-medium text-brand-text-muted flex justify-between">
              <span>{t('rules.matchingRules', filteredRules.length)}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-brand-border-subtle/50">
              {filteredRules.length === 0 ? (
                <div className="p-6 text-center text-sm text-brand-text-muted">
                  {t('rules.noMatch')}
                </div>
              ) : (
                filteredRules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={clsx(
                      'w-full text-left p-3.5 transition-colors',
                      selectedRuleId === rule.id
                        ? 'bg-brand-cyan/10 border-l-2 border-brand-cyan shadow-[inset_0_0_12px_rgba(34,211,238,0.08)]'
                        : 'hover:bg-brand-cyan/5 border-l-2 border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-brand-cyan">
                        {t('rules.ruleItem', rule.id)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-brand-text-muted" />
                    </div>
                    <p className="text-sm font-medium text-brand-text line-clamp-1">
                      {rule.title.startsWith('Rule Clause ')
                        ? t('rules.ruleClauseTitle', rule.id)
                        : rule.title}
                    </p>
                    <span className="badge bg-brand-border-subtle text-brand-text-muted mt-1 text-[11px]">
                      {t('rules.cat.' + rule.category) !== 'rules.cat.' + rule.category
                        ? t('rules.cat.' + rule.category)
                        : rule.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Rule Detail Column */}
          <div
            className={clsx(
              'flex-1 overflow-y-auto p-4 lg:p-6',
              !selectedRule && 'hidden lg:block'
            )}
          >
            {selectedRule ? (
              <motion.div
                key={selectedRule.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 max-w-3xl"
              >
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedRuleId(null)}
                  className="lg:hidden inline-flex items-center gap-1.5 text-xs text-brand-cyan hover:text-brand-text mb-2"
                >
                  <ArrowLeft className="h-4 w-4" /> {t('rules.backToList')}
                </button>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-xl font-mono font-bold text-brand-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                      {t('rules.ruleItem', selectedRule.id)}
                    </span>
                    <h2 className="text-lg font-bold text-brand-text mt-1">
                      {selectedRule.title.startsWith('Rule Clause ')
                        ? t('rules.ruleClauseTitle', selectedRule.id)
                        : selectedRule.title}
                    </h2>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="badge bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25 flex items-center gap-1">
                      <Tag className="h-3 w-3" />{' '}
                      {t('rules.cat.' + selectedRule.category) !== 'rules.cat.' + selectedRule.category
                        ? t('rules.cat.' + selectedRule.category)
                        : selectedRule.category}
                    </span>
                    {selectedRule.severity && (
                      <span className="badge bg-brand-warning/20 text-brand-warning flex items-center gap-1">
                        <Shield className="h-3 w-3" />{' '}
                        {t('rules.sev.' + selectedRule.severity.toLowerCase()) !==
                        'rules.sev.' + selectedRule.severity.toLowerCase()
                          ? t('rules.sev.' + selectedRule.severity.toLowerCase())
                          : selectedRule.severity}
                      </span>
                    )}
                    <span className="badge bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 text-[10px] font-mono">
                      {t('rules.whitelistVerified')}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-brand-bg/50 border border-brand-border-subtle p-4 text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedRule.description.startsWith('Official Grand Mobile regulation clause ')
                    ? t('rules.refsOnly')
                    : selectedRule.description}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-brand-text-muted">
                    {t('rules.source')} <code className="font-mono text-brand-cyan">GET /rules/refs</code>
                  </span>
                  <Link
                    to={`/playground?ref=${encodeURIComponent(selectedRule.id)}`}
                    className="btn-cyan-outline py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    {t('rules.testInPlayground')}
                  </Link>
                </div>

                {selectedRule.examples && selectedRule.examples.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-2">
                      {t('rules.examplesInfractions')}
                    </h3>
                    <ul className="space-y-2">
                      {selectedRule.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="rounded-lg bg-brand-bg/30 border border-brand-border-subtle p-3 text-xs text-brand-text-secondary"
                        >
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-brand-text-muted">
                <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">{t('rules.selectToView')}</p>
                <p className="text-xs text-brand-text-muted mt-0.5">{t('rules.clickFromList')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
