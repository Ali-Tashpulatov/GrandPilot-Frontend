import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { demoAnalyticsData, demoTickets } from '@/data/demo';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const escalationCount = demoTickets.filter((t) => t.status === 'escalated').length;

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const isLight = theme === 'light';
  const textColor = isLight ? '#0F172A' : '#F8FAFC';
  const accent = isLight ? '#0369A1' : '#22D3EE';
  const tooltipStyle = {
    backgroundColor: isLight ? '#FFFFFF' : '#131E36',
    border: `1px solid ${isLight ? '#C7D4F0' : '#1E2E4E'}`,
    borderRadius: '8px',
    color: isLight ? '#0F172A' : '#F8FAFC',
    fontSize: '12px',
    padding: '10px 14px',
    maxWidth: 'min(280px, 75vw)',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
    boxShadow: isLight ? '0 8px 24px rgba(15,23,42,.12)' : '0 8px 24px rgba(0,0,0,.35)',
  };
  const gridStroke = isLight ? '#DDE5F8' : '#1E2E4E';
  const tickFill = isLight ? '#475569' : '#CBD5E1';
  const tooltipProps = {
    contentStyle: tooltipStyle,
    itemStyle: { color: textColor, padding: '3px 0' },
    labelStyle: { color: textColor, fontWeight: 600, marginBottom: 4 },
    wrapperStyle: { zIndex: 20 },
  }; 
  const activeDotStroke = isLight ? '#F0F4FF' : '#0B1120';

  const localizedTicketVolume = useMemo(() => {
    const dayMap: Record<string, string> = {
      Mon: t('analytics.dayMon'),
      Tue: t('analytics.dayTue'),
      Wed: t('analytics.dayWed'),
      Thu: t('analytics.dayThu'),
      Fri: t('analytics.dayFri'),
      Sat: t('analytics.daySat'),
      Sun: t('analytics.daySun'),
    };
    return demoAnalyticsData.ticketVolume.map((item) => ({
      ...item,
      date: dayMap[item.date] || item.date,
    }));
  }, [t]);

  const localizedCategoryDistribution = useMemo(() => {
    const categoryMap: Record<string, string> = {
      Insults: t('analytics.catInsults'),
      Cheating: t('analytics.catCheating'),
      'Scam/Fraud': t('analytics.catScam'),
      Bugs: t('analytics.catBugs'),
      Payment: t('analytics.catPayment'),
      Other: t('analytics.catOther'),
    };
    return demoAnalyticsData.categoryDistribution.map((item) => ({
      ...item,
      name: categoryMap[item.name] || item.name,
    }));
  }, [t]);

  const localizedPriorityDistribution = useMemo(() => {
    const priorityMap: Record<string, string> = {
      'P0 (Critical)': t('priority.p0'),
      'P1 (High)': t('priority.p1'),
      'P2 (Medium)': t('priority.p2'),
      'P3 (Low)': t('priority.p3'),
    };
    return demoAnalyticsData.priorityDistribution.map((item) => ({
      ...item,
      name: priorityMap[item.name] || item.name,
    }));
  }, [t]);

  const localizedStatusDistribution = useMemo(() => {
    const statusMap: Record<string, string> = {
      New: t('status.new'),
      'AI Resolved': t('status.ai_resolved'),
      Escalated: t('status.escalated'),
      Closed: t('status.closed'),
    };
    return demoAnalyticsData.statusDistribution.map((item) => ({
      ...item,
      name: statusMap[item.name] || item.name,
    }));
  }, [t]);

  return (
    <motion.div
      className="analytics-charts space-y-4 p-4 lg:p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <p className="text-sm text-brand-text-muted">{t('data.demoNotice')}</p>
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-lg shadow-brand-cyan/25">
          <BarChart3 className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text">{t('analytics.title')}</h1>
          <p className="text-sm text-brand-text-secondary">{t('analytics.subtitle')}</p>
        </div>
      </motion.div>

      {/* Ticket Volume */}
      <motion.div variants={item} className="card">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-brand-text">{t('analytics.ticketVolume')}</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={localizedTicketVolume}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickFill, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipProps} cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="tickets"
                name={t('analytics.ticketsCount')}
                stroke={accent}
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ fill: accent, r: 4, strokeWidth: 0 }}
                activeDot={{ fill: accent, r: 6, stroke: activeDotStroke, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Category Distribution */}
        <motion.div variants={item} className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-brand-text">{t('analytics.categoryDist')}</h3>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={localizedCategoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {localizedCategoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-0 flex-1">
              {localizedCategoryDistribution.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-brand-text-secondary">{c.name}</span>
                  <span className="text-brand-text font-medium ml-auto">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div variants={item} className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-brand-text">{t('analytics.priorityDist')}</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedPriorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" interval={0} tickFormatter={(value: string) => value.split(' —')[0]} tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tickFill, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipProps} cursor={{ fill: isLight ? 'rgba(14,165,233,0.09)' : 'rgba(34,211,238,0.08)', stroke: 'none' }} />
                <Bar name={t('analytics.ticketsCount')} activeBar={{ stroke: accent, strokeWidth: 2 }} dataKey="value" radius={[6, 6, 0, 0]}>
                  {localizedPriorityDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Escalations */}
        <motion.div variants={item} className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-brand-text">{t('analytics.escalations')}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-warning/10 border border-brand-warning/20">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-warning">{escalationCount}</p>
                <p className="text-xs text-brand-warning/70">{t('analytics.ticketsCount')}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-warning" />
                <span className="text-sm text-brand-text-secondary">
                  {t('analytics.escalatedToHuman', escalationCount)}
                </span>
              </div>
              <p className="text-xs text-brand-text-muted">
                {t('analytics.escalationsDesc')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={item} className="card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-brand-text">{t('analytics.statusDist')}</h3>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2 text-xs text-brand-text-secondary">
            {localizedStatusDistribution.map(entry => <span key={entry.name} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />{entry.name}</span>)}
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={localizedStatusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={{ stroke: tickFill }}
                  label={({ x, y, cx, percent }) => (
                    <text x={x} y={y} fill={textColor} fontSize={12} textAnchor={Number(x) > Number(cx) ? 'start' : 'end'} dominantBaseline="central">
                      {`${((percent ?? 0) * 100).toFixed(0)}%`}
                    </text>
                  )}
                >
                  {localizedStatusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
