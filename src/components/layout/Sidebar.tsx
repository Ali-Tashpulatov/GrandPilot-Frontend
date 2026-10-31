import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Ticket,
  FlaskConical,
  BookOpen,
  BarChart3,
  Settings,
  X,
  Home,
} from 'lucide-react';
import { t } from '@/i18n/translations';
import type { SupportedLanguage } from '@/types/api';
import clsx from 'clsx';

const navItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/tickets', icon: Ticket, labelKey: 'nav.tickets' },
  { path: '/playground', icon: FlaskConical, labelKey: 'nav.playground' },
  { path: '/rules', icon: BookOpen, labelKey: 'nav.rules' },
  { path: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

interface SidebarProps {
  language: SupportedLanguage;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ language, onClose }: { language: SupportedLanguage; onClose?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-brand-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-brand-border-subtle">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 shadow-md shadow-brand-cyan/25">
          <img src="/gp-symbol.png" alt="GrandPilot" className="h-6 w-6 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-brand-text truncate">GrandPilot</h1>
          <p className="text-xs text-brand-text-muted">Grand Mobile</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={clsx(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-brand-cyan/20 via-brand-cyan/10 to-transparent text-brand-text border-l-2 border-brand-cyan shadow-[inset_1px_0_12px_rgba(34,211,238,0.18)]'
                  : 'text-brand-text-secondary hover:bg-brand-cyan/5 hover:text-brand-cyan border-l-2 border-transparent'
              )}
            >
              <item.icon
                className={clsx(
                  'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                  isActive
                    ? 'text-brand-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                    : 'text-brand-text-muted group-hover:text-brand-cyan'
                )}
              />
              <span className={clsx(isActive && 'font-semibold text-brand-text')}>{t(item.labelKey, language)}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-cyan/15 to-transparent -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Operator Profile */}
      <div className="border-t border-brand-border-subtle px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 text-sm font-bold text-slate-950 shadow-sm shadow-brand-cyan/30">
            OP
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-text truncate">{t('sidebar.operator', language)}</p>
            <p className="text-xs text-brand-text-muted">{t('sidebar.supportAgent', language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ language, isMobile, isOpen, onClose }: SidebarProps) {
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] shadow-2xl"
            >
              <button aria-label={t('general.close', language)}
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-brand-text-muted hover:bg-brand-border-subtle hover:text-brand-text"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent language={language} onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside id="grandpilot-sidebar" className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-shrink-0 lg:block">
      <SidebarContent language={language} />
    </aside>
  );
}
