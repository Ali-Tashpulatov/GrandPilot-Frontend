import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import type { SupportedLanguage } from '@/types/api';

const pathTitles: Record<string, string> = {
  '/': 'nav.home',
  '/tickets': 'nav.tickets',
  '/playground': 'nav.playground',
  '/rules': 'nav.rules',
  '/analytics': 'nav.analytics',
  '/settings': 'nav.settings',
};

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, t } = useLanguage();
  // Mount the theme hook here so it runs early and sets data-theme on <html>
  useTheme();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const titleKey = pathTitles[location.pathname] || 'nav.home';
  const title = t(titleKey);

  return (
    <div className="min-h-screen bg-brand-bg transition-colors duration-300">
      {/* Desktop sidebar */}
      <Sidebar language={language} />
      {/* Mobile sidebar */}
      <Sidebar
        language={language}
        isMobile
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet context={{ language }} />
        </main>
      </div>
    </div>
  );
}

export function useAppContext() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (window as any).__appContext || { language: 'en' as SupportedLanguage };
  return context;
}
