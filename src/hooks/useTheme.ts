import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app_theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  // Keep the legacy .dark class for any code that still checks it
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark')
  );

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync across tabs
  useEffect(() => {
    const handler = () => {
      const saved = (localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark');
      setThemeState(saved);
    };
    window.addEventListener('storage', handler);
    window.addEventListener('themeChange', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('themeChange', handler);
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new Event('themeChange'));
  }, []);

  return { theme, setTheme };
}
