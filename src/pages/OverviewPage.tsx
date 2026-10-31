import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket,
  Clock,
  Brain,
  AlertTriangle,
  FlaskConical,
  BookOpen,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { demoTickets } from '@/data/demo';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const pendingTickets = demoTickets.filter((t) => t.status === 'new');
const urgentTickets = demoTickets.filter(
  (t) => t.triage?.priority === 'p1' && t.status !== 'closed'
);

export default function OverviewPage() {
  const { t } = useLanguage();

  const quickActions = [
    {
      label: t('home.qaSupportTickets'),
      description: t('home.qaSupportTicketsDesc'),
      icon: Ticket,
      path: '/tickets',
      accent: 'text-brand-cyan',
      bg: 'bg-brand-cyan/10',
    },
    {
      label: t('home.qaPlayground'),
      description: t('home.qaPlaygroundDesc'),
      icon: FlaskConical,
      path: '/playground',
      accent: 'text-brand-cyan',
      bg: 'bg-brand-cyan/10',
    },
    {
      label: t('home.qaRules'),
      description: t('home.qaRulesDesc'),
      icon: BookOpen,
      path: '/rules',
      accent: 'text-brand-success',
      bg: 'bg-brand-success/10',
    },
    {
      label: t('home.qaAnalytics'),
      description: t('home.qaAnalyticsDesc'),
      icon: BarChart3,
      path: '/analytics',
      accent: 'text-brand-warning',
      bg: 'bg-brand-warning/10',
    },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t('time.minsAgo', mins);
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('time.hrsAgo', hrs);
    return t('time.daysAgo', Math.floor(hrs / 24));
  };

  return (
    <motion.div
      className="space-y-6 p-4 lg:p-6 max-w-6xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <p className="px-4 text-sm text-brand-text-muted">{t('data.demoNotice')}</p>
      {/* ── Welcome Section ──────────────────────────────────── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-xl border border-brand-border-subtle bg-gradient-to-br from-brand-card via-brand-sidebar to-brand-card p-6 lg:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/25">
              <img src="/gp-symbol.png" alt="GrandPilot" className="h-7 w-7 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-text lg:text-2xl">
                {t('home.welcomeTitle')}
              </h1>
              <p className="text-sm text-brand-text-secondary">
                {t('home.welcomeSubtitle')}
              </p>
            </div>
          </div>
          <p className="text-sm text-brand-text-muted mt-3 max-w-xl">
            {t('home.welcomeDesc')}
          </p>
        </div>
        {/* Decorative gradient orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-brand-cyan/5 blur-3xl" />
      </motion.div>

      {/* ── Ticket Summary Cards (Clickable to Filter) ───────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('home.totalTickets'),
            value: demoTickets.length,
            icon: Ticket,
            accent: 'text-brand-cyan',
            bg: 'bg-brand-cyan/10',
            link: '/tickets',
            hint: t('home.viewAllTicketsHint'),
          },
          {
            label: t('home.pendingReview'),
            value: pendingTickets.length,
            icon: Clock,
            accent: 'text-brand-warning',
            bg: 'bg-brand-warning/10',
            link: '/tickets?status=new',
            hint: t('home.filterByNewHint'),
          },
          {
            label: t('home.aiProcessed'),
            value: demoTickets.filter((t) => t.status === 'ai_resolved').length,
            icon: Brain,
            accent: 'text-brand-success',
            bg: 'bg-brand-success/10',
            link: '/tickets?status=ai_resolved',
            hint: t('home.filterByResolvedHint'),
          },
          {
            label: t('home.escalations'),
            value: demoTickets.filter((t) => t.status === 'escalated').length,
            icon: AlertTriangle,
            accent: 'text-brand-danger',
            bg: 'bg-brand-danger/10',
            link: '/tickets?status=escalated',
            hint: t('home.filterByEscalatedHint'),
          },
        ].map((s) => (
          <Link key={s.label} to={s.link} className="block group">
            <motion.div variants={item} className="card-hover h-full transition-transform active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-text-muted">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-brand-text">{s.value}</p>
                  <p className="mt-1 text-[11px] text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                    {s.hint} <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.accent}`} />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── Urgent & Pending Alerts ──────────────────────────── */}
      {(urgentTickets.length > 0 || pendingTickets.length > 0) && (
        <motion.div
          variants={item}
          className={`grid grid-cols-1 gap-4${urgentTickets.length > 0 && pendingTickets.length > 0 ? ' sm:grid-cols-2' : ''}`}
        >
          {/* Urgent Tickets */}
          {urgentTickets.length > 0 && (
            <div className="card border-brand-danger/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-brand-danger" />
                    <h3 className="text-sm font-semibold text-brand-danger">
                      {t('home.urgentTickets')} ({urgentTickets.length})
                    </h3>
                  </div>
                  <span className="badge bg-brand-danger/15 text-brand-danger text-[10px] font-mono">
                    {t('home.urgentPriorityTag')}
                  </span>
                </div>
                <div className="space-y-2">
                  {urgentTickets.slice(0, 3).map((tkt) => (
                    <Link
                      key={tkt.id}
                      to={`/tickets?ticket=${tkt.id}`}
                      className="flex items-center gap-3 rounded-lg bg-brand-bg/60 p-2.5 border border-brand-border-subtle hover:border-brand-danger/50 hover:bg-brand-card-hover transition-all group"
                      title={t('home.openTicketTitle')}
                    >
                      <span className="text-xs font-mono font-semibold text-brand-danger group-hover:underline shrink-0">
                        {tkt.id}
                      </span>
                      <p className="flex-1 truncate text-xs text-brand-text-secondary group-hover:text-brand-text min-w-0">
                        {tkt.complaint}
                      </p>
                      <StatusBadge type="priority" value="p1" />
                      <ArrowRight className="h-3.5 w-3.5 text-brand-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/tickets?priority=p1"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-danger hover:underline pt-2 border-t border-brand-danger/15"
              >
                {t('home.viewAllUrgent', urgentTickets.length)} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Pending Review Tickets */}
          {pendingTickets.length > 0 && (
            <div className="card border-brand-warning/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-warning" />
                    <h3 className="text-sm font-semibold text-brand-warning">
                      {t('home.pendingReviewBox')} ({pendingTickets.length})
                    </h3>
                  </div>
                  <span className="badge bg-brand-warning/15 text-brand-warning text-[10px] font-mono">
                    {t('home.pendingStatusTag')}
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingTickets.slice(0, 3).map((tkt) => (
                    <Link
                      key={tkt.id}
                      to={`/tickets?ticket=${tkt.id}`}
                      className="flex items-center gap-3 rounded-lg bg-brand-bg/60 p-2.5 border border-brand-border-subtle hover:border-brand-warning/50 hover:bg-brand-card-hover transition-all group"
                      title={t('home.openTicketTitle')}
                    >
                      <span className="text-xs font-mono font-semibold text-brand-warning group-hover:underline shrink-0">
                        {tkt.id}
                      </span>
                      <p className="flex-1 truncate text-xs text-brand-text-secondary group-hover:text-brand-text min-w-0">
                        {tkt.complaint}
                      </p>
                      <StatusBadge type="status" value="new" />
                      <ArrowRight className="h-3.5 w-3.5 text-brand-warning opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/tickets?status=new"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-warning hover:underline pt-2 border-t border-brand-warning/15"
              >
                {t('home.viewAllPending', pendingTickets.length)} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Quick Actions ────────────────────────────────────── */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">{t('home.quickActions')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className="block group">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="card-hover h-full flex flex-col justify-between"
              >
                <div>
                  <div className={`mb-3 inline-flex rounded-xl p-2.5 ${a.bg}`}>
                    <a.icon className={`h-5 w-5 ${a.accent}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-brand-text group-hover:text-brand-cyan transition-colors">
                    {a.label}
                  </h3>
                  <p className="mt-1 text-xs text-brand-text-muted leading-relaxed">
                    {a.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-cyan group-hover:translate-x-1 transition-transform">
                  {t('home.openAction', a.label)} <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Tickets ───────────────────────────────────── */}
      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-brand-text">{t('home.recentTicketsTitle')}</h3>
            <p className="text-xs text-brand-text-muted mt-0.5">{t('home.recentTicketsDesc')}</p>
          </div>
          <Link
            to="/tickets"
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1 py-1 px-2 rounded-md hover:bg-brand-cyan/10 transition-colors"
          >
            {t('home.viewAllTicketsBtn')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {demoTickets.slice(0, 5).map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets?ticket=${ticket.id}`}
              className="flex items-center gap-3 rounded-lg border border-brand-border-subtle bg-brand-bg/40 px-3 py-2.5 hover:border-brand-cyan/40 hover:bg-brand-card-hover hover:shadow-cyan-sm transition-all group block"
            >
              <span className="text-xs font-mono font-semibold text-brand-cyan w-16 flex-shrink-0 group-hover:underline">
                {ticket.id}
              </span>
              <p className="flex-1 truncate text-sm text-brand-text-secondary group-hover:text-brand-text min-w-0">
                {ticket.complaint}
              </p>
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <StatusBadge type="priority" value={ticket.triage?.priority || 'p3'} />
                <StatusBadge type="status" value={ticket.status} />
              </div>
              <span className="text-xs text-brand-text-muted whitespace-nowrap flex-shrink-0">
                {timeAgo(ticket.created_at)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-brand-border-subtle/50 text-xs text-brand-text-muted">
          <span>{t('home.showingRecent')}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
