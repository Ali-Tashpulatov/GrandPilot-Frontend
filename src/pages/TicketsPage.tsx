import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Inbox,
  FileText,
  Bot,
  Copy,
  Check,
  AlertTriangle,
  Edit3,
  Shield,
  ArrowUpRight,
  User,
  Globe,
  Tag,
  Gauge,
  BookOpen,
  X,
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import api from '@/services/api';
import { useLanguage } from '@/hooks/useLanguage';
import { demoTickets } from '@/data/demo';
import type { Ticket } from '@/types/api';

type MobilePanel = 'inbox' | 'details' | 'copilot';

interface OperatorAction {
  action: 'approved' | 'edited' | 'escalated';
  editedDraft?: string;
  timestamp: string;
}

export default function TicketsPage() {
  const { t } = useLanguage();
  const [newText, setNewText] = useState('');
  const [newLanguage, setNewLanguage] = useState('ru');
  const [newKind, setNewKind] = useState<'complaint' | 'report'>('complaint');
  const [tickets, setTickets] = useState<Ticket[]>(demoTickets);
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTicketId = searchParams.get('ticket') || searchParams.get('id');
  const urlPriority = searchParams.get('priority');
  const urlStatus = searchParams.get('status');
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');

  // Helper to determine initial selected ticket ID
  const getInitialSelectedId = (): string | null => {
    if (urlTicketId) {
      const match = demoTickets.find((t) => t.id.toLowerCase() === urlTicketId.toLowerCase());
      if (match) return match.id;
    }
    // Filter demo tickets by initial URL params
    const initialFiltered = demoTickets.filter((t) => {
      if (urlSearch) {
        const q = urlSearch.toLowerCase();
        if (!t.id.toLowerCase().includes(q) && !t.complaint.toLowerCase().includes(q)) return false;
      }
      if (urlCategory && urlCategory !== 'all' && !t.triage?.category.includes(urlCategory)) return false;
      if (urlPriority && urlPriority !== 'all' && t.triage?.priority !== urlPriority) return false;
      if (urlStatus && urlStatus !== 'all' && t.status !== urlStatus) return false;
      return true;
    });
    return initialFiltered[0]?.id || null;
  };

  const initialSelectedId = getInitialSelectedId();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [searchQuery, setSearchQuery] = useState(() => urlSearch || '');
  const [filterCategory, setFilterCategory] = useState(() => urlCategory || 'all');
  const [filterPriority, setFilterPriority] = useState(() => urlPriority || 'all');
  const [filterStatus, setFilterStatus] = useState(() => urlStatus || 'all');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(() => (urlTicketId ? 'details' : 'inbox'));
  const [operatorActions, setOperatorActions] = useState<Record<string, OperatorAction>>({});
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<string>(() => {
    const t = demoTickets.find((tk) => tk.id === initialSelectedId);
    return t?.triage?.draft || '';
  });
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [analyzingTicketId, setAnalyzingTicketId] = useState<string | null>(null);

  const selectedTicketRef = useRef<HTMLButtonElement | null>(null);

  // Sync state when URL searchParams change
  useEffect(() => {
    const tId = searchParams.get('ticket') || searchParams.get('id');
    const p = searchParams.get('priority');
    const s = searchParams.get('status');
    const c = searchParams.get('category');
    const q = searchParams.get('search');

    if (tId) {
      const target = tickets.find((tk) => tk.id.toLowerCase() === tId.toLowerCase());
      if (target) {
        setSelectedId(target.id);
        setMobilePanel('details');
        if (target.triage?.draft) {
          setEditDraft(target.triage.draft);
        }
        // Ensure conflicting filters do not hide the selected ticket
        if (filterStatus !== 'all' && target.status !== filterStatus) {
          setFilterStatus('all');
        }
        if (filterPriority !== 'all' && target.triage?.priority !== filterPriority) {
          setFilterPriority('all');
        }
        if (filterCategory !== 'all' && target.triage?.category && !target.triage.category.includes(filterCategory)) {
          setFilterCategory('all');
        }
        if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          if (!target.id.toLowerCase().includes(lowerQ) && !target.complaint.toLowerCase().includes(lowerQ)) {
            setSearchQuery('');
          }
        }
      }
    } else {
      setFilterPriority(p || 'all');
      setFilterStatus(s || 'all');
      setFilterCategory(c || 'all');
      setSearchQuery(q || '');
    }
  }, [searchParams]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) || null,
    [tickets, selectedId]
  );

  // Scroll active ticket into view in inbox list when selectedId changes
  useEffect(() => {
    if (selectedId && selectedTicketRef.current) {
      selectedTicketRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);

  const handleRunTriage = async (ticket: Ticket) => {
    try {
      setAnalyzingTicketId(ticket.id);
      const triageRes = await api.triage({
        ticket_id: ticket.id,
        kind: ticket.kind || 'complaint',
        complaint: ticket.complaint,
        lang: ticket.language,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                triage: triageRes,
                status: (triageRes.needs_human || triageRes.verdict === 'escalated') ? 'escalated' : 'processing',
              }
            : t
        )
      );
      
      showToast(t('tickets.triageDone', ticket.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Triage failed';
      showToast(t('api.error'));
    } finally {
      setAnalyzingTicketId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.id.toLowerCase().includes(q) && !t.complaint.toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== 'all' && !t.triage?.category.includes(filterCategory)) return false;
      if (filterPriority !== 'all' && t.triage?.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [tickets, searchQuery, filterCategory, filterPriority, filterStatus]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleApprove = () => {
    if (!selectedId) return;
    setOperatorActions((prev) => ({
      ...prev,
      [selectedId]: { action: 'approved', timestamp: new Date().toISOString() },
    }));
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: 'closed' as const, operator_action: 'approved' as const } : t))
    );
    showToast(t('tickets.toastApproved'));
  };

  const handleEscalate = () => {
    if (!selectedId) return;
    setOperatorActions((prev) => ({
      ...prev,
      [selectedId]: { action: 'escalated', timestamp: new Date().toISOString() },
    }));
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: 'escalated' as const, operator_action: 'escalated' as const } : t))
    );
    showToast(t('tickets.toastEscalated'));
  };

  const handleSaveEdit = () => {
    if (!selectedId) return;
    setOperatorActions((prev) => ({
      ...prev,
      [selectedId]: { action: 'edited', editedDraft: editDraft, timestamp: new Date().toISOString() },
    }));
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedId ? { ...t, edited_draft: editDraft, operator_action: 'edited' as const } : t
      )
    );
    setEditMode(false);
    showToast(t('tickets.toastSaved'));
  };

  const handleCopyDraft = async () => {
    const text = operatorActions[selectedId!]?.editedDraft || selectedTicket?.triage?.draft || '';
    try { await navigator.clipboard.writeText(text); }
    catch { showToast(t('general.copyFailed')); return; }
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleSelectTicket = (id: string) => {
    setSelectedId(id);
    setEditMode(false);
    setMobilePanel('details');
    const tkt = tickets.find((tk) => tk.id === id);
    if (tkt?.triage?.draft) setEditDraft(tkt.triage.draft);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        next.delete('id');
        next.set('ticket', id);
        return next;
      },
      { replace: true }
    );
  };

  const handleFilterCategoryChange = (val: string) => {
    setFilterCategory(val);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        next.delete('id');
        if (val === 'all') next.delete('category');
        else next.set('category', val);
        return next;
      },
      { replace: true }
    );
  };

  const handleFilterPriorityChange = (val: string) => {
    setFilterPriority(val);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        next.delete('id');
        if (val === 'all') next.delete('priority');
        else next.set('priority', val);
        return next;
      },
      { replace: true }
    );
  };

  const handleFilterStatusChange = (val: string) => {
    setFilterStatus(val);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        next.delete('id');
        if (val === 'all') next.delete('status');
        else next.set('status', val);
        return next;
      },
      { replace: true }
    );
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('ticket');
        next.delete('id');
        if (!val.trim()) next.delete('search');
        else next.set('search', val);
        return next;
      },
      { replace: true }
    );
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t('time.minsAgo', mins);
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('time.hrsAgo', hrs);
    return t('time.daysAgo', Math.floor(hrs / 24));
  };

  // ─── INBOX PANEL ──────────────────────────────────────────────
  const InboxPanel = (
    <div className="flex h-full flex-col border-r border-brand-border-subtle">
      <div className="border-b border-brand-border-subtle p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            placeholder={t('tickets.search')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => handleFilterCategoryChange(e.target.value)}
            className="input-field py-1.5 text-xs flex-1 min-w-[80px]"
          >
            <option value="all">{t('tickets.allCategories')}</option>
            <option value="insult">{t('tickets.catInsult')}</option>
            <option value="cheat">{t('tickets.catCheating')}</option>
            <option value="scam">{t('tickets.catScam')}</option>
            <option value="bug">{t('tickets.catBug')}</option>
            <option value="payment">{t('tickets.catPayment')}</option>
            <option value="harassment">{t('tickets.catHarassment')}</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => handleFilterPriorityChange(e.target.value)}
            className="input-field py-1.5 text-xs flex-1 min-w-[60px]"
          >
            <option value="all">{t('tickets.priorityAll')}</option>
            <option value="p1">{t('priority.p1')}</option>
            <option value="p2">{t('priority.p2')}</option>
            <option value="p3">{t('priority.p3')}</option>
            <option value="p0">{t('priority.p0')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterStatusChange(e.target.value)}
            className="input-field py-1.5 text-xs flex-1 min-w-[70px]"
          >
            <option value="all">{t('tickets.statusAll')}</option>
            <option value="new">{t('status.new')}</option>
            <option value="ai_resolved">{t('status.ai_resolved')}</option>
            <option value="escalated">{t('status.escalated')}</option>
            <option value="closed">{t('status.closed')}</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="p-6 text-center text-sm text-brand-text-muted">{t('tickets.noMatch')}</div>
        ) : (
          filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              ref={selectedId === ticket.id ? selectedTicketRef : undefined}
              onClick={() => handleSelectTicket(ticket.id)}
              className={clsx(
                'w-full text-left px-4 py-3 border-b border-brand-border-subtle transition-all',
                selectedId === ticket.id
                  ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan shadow-[inset_0_0_15px_rgba(34,211,238,0.08)]'
                  : 'hover:bg-brand-cyan/5 border-l-2 border-l-transparent'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-medium text-brand-cyan">{ticket.id}</span>
                <span className="text-xs text-brand-text-muted">{timeAgo(ticket.created_at)}</span>
              </div>
              <p className="text-sm text-brand-text-secondary line-clamp-2 mb-2">{ticket.complaint}</p>
              <div className="flex items-center gap-2">
                <StatusBadge type="priority" value={ticket.triage?.priority || 'p3'} />
                <StatusBadge type="status" value={ticket.status} />
                {operatorActions[ticket.id] && (
                  <span className="badge bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                    {operatorActions[ticket.id].action === 'approved'
                      ? t('tickets.approve')
                      : operatorActions[ticket.id].action === 'edited'
                        ? t('tickets.edit')
                        : t('tickets.escalate')}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ─── DETAILS PANEL ────────────────────────────────────────────
  const DetailsPanel = (
    <div className="flex h-full flex-col overflow-y-auto">
      {!selectedTicket ? (
        <EmptyState icon={FileText} title={t('tickets.noSelectedTitle')} description={t('tickets.noSelectedDesc')} />
      ) : (
        <div className="p-4 lg:p-5 space-y-5">
          {/* Mobile Back / Forward Bar */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-brand-border-subtle">
            <button
              onClick={() => setMobilePanel('inbox')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-cyan hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('tickets.backToInbox')}
            </button>
            <button
              onClick={() => setMobilePanel('copilot')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1 text-xs font-medium text-brand-cyan hover:bg-brand-cyan/20"
            >
              <Bot className="h-3.5 w-3.5" /> {t('tickets.openCopilot')} <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold font-mono text-brand-text">{selectedTicket.id}</h2>
            <StatusBadge type="status" value={selectedTicket.status} />
            {selectedTicket.triage && <StatusBadge type="priority" value={selectedTicket.triage.priority} />}
          </div>

          {/* Operator action banner */}
          {operatorActions[selectedTicket.id] && (
            <div className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2.5 text-sm">
              <span className="font-medium text-brand-cyan">
                {t(
                  'tickets.operatorActionBanner',
                  operatorActions[selectedTicket.id].action === 'approved'
                    ? t('tickets.approve')
                    : operatorActions[selectedTicket.id].action === 'edited'
                      ? t('tickets.edit')
                      : t('tickets.escalate'),
                  new Date(operatorActions[selectedTicket.id].timestamp).toLocaleTimeString()
                )}
              </span>
            </div>
          )}

          {/* Player Complaint */}
          <div>
            <h3 className="text-sm font-semibold text-brand-text mb-2">{t('tickets.playerComplaint')}</h3>
            <div className="rounded-lg bg-brand-bg/60 border border-brand-border-subtle p-4 text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap">
              {selectedTicket.complaint}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {selectedTicket.player_id && (
              <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5 text-brand-text-muted" />
                  <span className="text-xs text-brand-text-muted">{t('tickets.playerId')}</span>
                </div>
                <p className="text-sm font-mono text-brand-text">{selectedTicket.player_id}</p>
              </div>
            )}
            <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-3">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-3.5 w-3.5 text-brand-text-muted" />
                <span className="text-xs text-brand-text-muted">{t('tickets.language')}</span>
              </div>
              <p className="text-sm text-brand-text">{selectedTicket.language.toUpperCase()}</p>
            </div>
            {selectedTicket.triage && (
              <>
                <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-3.5 w-3.5 text-brand-text-muted" />
                    <span className="text-xs text-brand-text-muted">{t('tickets.category')}</span>
                  </div>
                  <p className="text-sm text-brand-text">
                    {t('category.' + selectedTicket.triage.category) !== 'category.' + selectedTicket.triage.category
                      ? t('category.' + selectedTicket.triage.category)
                      : selectedTicket.triage.category}
                  </p>
                </div>
                <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-3.5 w-3.5 text-brand-text-muted" />
                    <span className="text-xs text-brand-text-muted">{t('tickets.confidence')}</span>
                  </div>
                  <p className="text-sm text-brand-text">
                    {Math.round(selectedTicket.triage.confidence * 100)}%
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Human review warning */}
          {selectedTicket.triage?.needs_human && (
            <div className="rounded-lg border border-brand-warning/30 bg-brand-warning/10 px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-brand-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-brand-warning">{t('tickets.flaggedHuman')}</p>
                <p className="text-xs text-brand-warning/70">{t('tickets.flaggedHumanDesc')}</p>
              </div>
            </div>
          )}

          {!selectedTicket.triage && (
            <div className="rounded-lg border border-brand-border-subtle bg-brand-bg/40 p-6 text-center space-y-3">
              <Bot className="mx-auto h-8 w-8 text-brand-cyan mb-1" />
              <p className="text-sm font-semibold text-brand-text">{t('tickets.awaitingAi')}</p>
              <p className="text-xs text-brand-text-muted max-w-sm mx-auto">
                {t('tickets.awaitingAiDesc')}
              </p>

            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── COPILOT PANEL ────────────────────────────────────────────
  const CopilotPanel = (
    <div className="flex h-full flex-col overflow-y-auto">
      {!selectedTicket ? (
        <EmptyState icon={Bot} title={t('tickets.copilot')} description={t('tickets.noSelectedDesc')} />
      ) : !selectedTicket.triage ? (
        <div className="p-6 text-center space-y-3 my-auto">
          <Bot className="mx-auto h-8 w-8 text-brand-cyan" />
          <h4 className="text-sm font-semibold text-brand-text">{t('tickets.noAiYet')}</h4>
          <p className="text-xs text-brand-text-muted max-w-xs mx-auto">
            {t('tickets.noAiYetDesc')}
          </p>
          <button
            onClick={() => handleRunTriage(selectedTicket)}
            disabled={analyzingTicketId !== null}
            className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2 mx-auto"
          >
            {analyzingTicketId === selectedTicket.id ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('tickets.processing')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('tickets.analyzeWithAI')}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 lg:p-5 space-y-4">
          {/* Mobile Back to Details */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-brand-border-subtle">
            <button
              onClick={() => setMobilePanel('details')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-cyan hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('tickets.backToDetails')}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
              <Bot className="h-4 w-4 text-brand-cyan" /> {t('tickets.classification')}
            </h3>
            <button
              onClick={() => handleRunTriage(selectedTicket)}
              disabled={analyzingTicketId !== null}
              className="text-[11px] text-brand-cyan hover:underline inline-flex items-center gap-1 font-medium disabled:opacity-50"
              title={t('tickets.reRunTitle')}
            >
              {analyzingTicketId === selectedTicket.id ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> {t('tickets.reAnalyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> {t('tickets.reEvaluate')}
                </>
              )}
            </button>
          </div>

          {/* Classification card */}
          <div className="rounded-lg bg-brand-bg/40 border border-brand-border-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">{t('tickets.category')}</span>
              <span className="text-sm font-medium text-brand-text">
                {t('category.' + selectedTicket.triage.category) !== 'category.' + selectedTicket.triage.category
                  ? t('category.' + selectedTicket.triage.category)
                  : selectedTicket.triage.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">{t('tickets.priority')}</span>
              <StatusBadge type="priority" value={selectedTicket.triage.priority} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">{t('tickets.confidence')}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-brand-border-subtle overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      selectedTicket.triage.confidence >= 0.8
                        ? 'bg-brand-success'
                        : selectedTicket.triage.confidence >= 0.6
                          ? 'bg-brand-warning'
                          : 'bg-brand-danger'
                    )}
                    style={{ width: `${selectedTicket.triage.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-brand-text">
                  {Math.round(selectedTicket.triage.confidence * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">{t('tickets.verdict')}</span>
              <span
                className={clsx(
                  'badge',
                  selectedTicket.triage.verdict === 'approved'
                    ? 'bg-brand-success/20 text-brand-success'
                    : selectedTicket.triage.verdict === 'escalated'
                      ? 'bg-brand-warning/20 text-brand-warning'
                      : 'bg-brand-danger/20 text-brand-danger'
                )}
              >
                {t('verdict.' + selectedTicket.triage.verdict) !== 'verdict.' + selectedTicket.triage.verdict
                  ? t('verdict.' + selectedTicket.triage.verdict)
                  : selectedTicket.triage.verdict}
              </span>
            </div>
            {typeof selectedTicket.triage.processing_time_ms === 'number' && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-border-subtle/50">
                <span className="text-brand-text-muted">{t('tickets.fastApiLatency')}</span>
                <span className="font-mono text-brand-cyan font-medium">
                  ⚡ {selectedTicket.triage.processing_time_ms.toFixed(1)}ms
                </span>
              </div>
            )}
            {selectedTicket.triage.needs_human && (
              <div className="flex items-center gap-2 pt-1">
                <AlertTriangle className="h-4 w-4 text-brand-warning" />
                <span className="text-xs font-medium text-brand-warning">{t('tickets.needsHumanReview')}</span>
              </div>
            )}
          </div>

          {/* Rule References */}
          {selectedTicket.triage.rule_refs.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-brand-text-muted mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {t('tickets.ruleReferences')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTicket.triage.rule_refs.map((ref) => (
                  <Link
                    key={ref}
                    to={`/rules?ref=${encodeURIComponent(ref)}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1 text-xs font-mono text-brand-cyan hover:bg-brand-cyan/20 hover:border-brand-cyan hover:shadow-cyan-sm cursor-pointer transition-all"
                    title={t('tickets.viewRuleTitle', ref)}
                  >
                    <BookOpen className="h-3 w-3" /> {t('rules.ruleItem', ref)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Punishment suggestion */}
          {selectedTicket.triage.punishment_suggestion && (
            <div>
              <h4 className="text-xs font-medium text-brand-text-muted mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> {t('tickets.punishmentSuggestion')}
              </h4>
              <div className="rounded-lg bg-brand-danger/5 border border-brand-danger/20 p-3 text-sm text-brand-text-secondary">
                {selectedTicket.triage.punishment_suggestion}
              </div>
            </div>
          )}

          {/* Suggested Reply */}
          <div>
            <h4 className="text-xs font-medium text-brand-text-muted mb-2">{t('tickets.suggestedReply')}</h4>

            {editMode ? (
              <div className="space-y-3">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="input-field min-h-[120px] text-sm leading-relaxed resize-y"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="btn-success flex-1">
                    <Check className="h-4 w-4" /> {t('general.save')}
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-secondary flex-1">
                    <X className="h-4 w-4" /> {t('general.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-brand-border-subtle bg-brand-bg/40 p-4 text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap">
                {operatorActions[selectedTicket.id]?.editedDraft || selectedTicket.triage.draft}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!editMode && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={operatorActions[selectedTicket.id]?.action === 'approved' || operatorActions[selectedTicket.id]?.action === 'escalated'}
                  className="btn-success flex-1"
                >
                  <Check className="h-4 w-4" /> {t('tickets.approve')}
                </button>
                <button
                  onClick={() => {
                    setEditDraft(
                      operatorActions[selectedTicket.id]?.editedDraft ||
                        selectedTicket.triage!.draft
                    );
                    setEditMode(true);
                  }}
                  disabled={operatorActions[selectedTicket.id]?.action === 'approved' || operatorActions[selectedTicket.id]?.action === 'escalated'}
                  className="btn-secondary flex-1"
                >
                  <Edit3 className="h-4 w-4" /> {t('tickets.edit')}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEscalate}
                  disabled={operatorActions[selectedTicket.id]?.action === 'approved' || operatorActions[selectedTicket.id]?.action === 'escalated'}
                  className="btn-danger flex-1"
                >
                  <ArrowUpRight className="h-4 w-4" /> {t('tickets.escalate')}
                </button>
                <button onClick={handleCopyDraft} className="btn-secondary flex-1">
                  {copiedDraft ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedDraft ? t('general.copied') : t('general.copy')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col">
      <p className="px-3 py-1 text-xs text-brand-text-muted">{t('data.demoNotice')}</p>
      {/* Toast */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text shadow-2xl"
          >
            {actionToast}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="px-3 py-2 border-b border-brand-border-subtle flex flex-wrap gap-2" onSubmit={e => {
        e.preventDefault();
        if (!newText.trim() || analyzingTicketId) return;
        const ticket: Ticket = { id: `TKT-${crypto.randomUUID()}`, complaint: newText.trim(), language: newLanguage, kind: newKind, status: 'new', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        setTickets(prev => [ticket, ...prev]); setSelectedId(ticket.id); setSearchParams({}); setMobilePanel('copilot'); setNewText('');
      }}>
        <input className="input-field min-w-0 flex-1" aria-label={t('tickets.playerComplaint')} placeholder={t('tickets.playerComplaint')} value={newText} onChange={e => setNewText(e.target.value)} required />
        <select className="input-field w-auto" aria-label={t('tickets.language')} value={newLanguage} onChange={e => setNewLanguage(e.target.value)}>{['kk','ru','uz','en'].map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}</select>
        <select className="input-field w-auto" aria-label={t('playground.kind')} value={newKind} onChange={e => setNewKind(e.target.value as 'complaint' | 'report')}><option value="complaint">{t('kind.complaint')}</option><option value="report">{t('kind.report')}</option></select>
        <button className="btn-secondary" disabled={!newText.trim() || analyzingTicketId !== null}>{t('tickets.addTicket')}</button>
      </form>
      {/* Mobile tabs */}
      <div className="flex border-b border-brand-border-subtle lg:hidden">
        {([
          { key: 'inbox' as MobilePanel, icon: Inbox, label: t('tickets.inbox') },
          { key: 'details' as MobilePanel, icon: FileText, label: t('tickets.details') },
          { key: 'copilot' as MobilePanel, icon: Bot, label: t('tickets.copilot') },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobilePanel(tab.key)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2',
              mobilePanel === tab.key
                ? 'border-brand-cyan text-brand-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]'
                : 'border-transparent text-brand-text-muted hover:text-brand-text-secondary'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop layout */}
      <div className="flex-1 hidden lg:flex min-h-0">
        <div className="w-80 flex-shrink-0">{InboxPanel}</div>
        <div className="flex-1 min-w-0 border-r border-brand-border-subtle">{DetailsPanel}</div>
        <div className="w-96 flex-shrink-0">{CopilotPanel}</div>
      </div>

      {/* Mobile layout */}
      <div className="flex-1 lg:hidden min-h-0 overflow-y-auto">
        {mobilePanel === 'inbox' && InboxPanel}
        {mobilePanel === 'details' && DetailsPanel}
        {mobilePanel === 'copilot' && CopilotPanel}
      </div>
    </div>
  );
}
