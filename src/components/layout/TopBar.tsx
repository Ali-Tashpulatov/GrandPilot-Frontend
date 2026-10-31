import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

const langOptions = [
  { code: 'kk', label: 'KK' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
] as const;

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/tickets');
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className="topbar-glass sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-brand-border-subtle bg-brand-bg/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile menu button */}
      <button
        aria-label={t('general.menu')}
        onClick={onMenuClick}
        className="rounded-lg p-2 text-brand-text-muted hover:bg-brand-border-subtle hover:text-brand-text lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h2 className="hidden sm:block text-lg font-semibold text-brand-text truncate">{title}</h2>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            placeholder={t('tickets.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </form>

      {/* Language Selector + Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Compact Language Switcher */}
        <div className="flex items-center rounded-lg border border-brand-border-subtle bg-brand-card/60 p-0.5">
          {langOptions.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={clsx(
                'relative px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-200',
                language === l.code
                  ? 'bg-brand-cyan text-slate-950 shadow-sm shadow-brand-cyan/30'
                  : 'text-brand-text-muted hover:text-brand-text'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200',
            'border-brand-border-subtle bg-brand-card/60 text-brand-text-muted',
            'hover:border-brand-cyan/40 hover:text-brand-cyan hover:bg-brand-cyan/5'
          )}
          aria-label={isDark ? t('settings.themeLight') : t('settings.themeDark')}
        >
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 text-xs font-bold text-slate-950 shadow-sm shadow-brand-cyan/30">
          OP
        </div>
      </div>
    </header>
  );
}
