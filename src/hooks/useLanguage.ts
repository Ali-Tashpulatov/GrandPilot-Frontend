import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '@/types/api';
import { t } from '@/i18n/translations';

function readLanguage(): SupportedLanguage {
  const value = localStorage.getItem('app_language');
  return value === 'ru' || value === 'kk' || value === 'uz' ? value : 'en';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    readLanguage
  );

  useEffect(() => {
    const handler = () => {
      setLanguageState(readLanguage());
    };
    window.addEventListener('languageChange', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('languageChange', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    localStorage.setItem('app_language', newLang);
    setLanguageState(newLang);
    window.dispatchEvent(new Event('languageChange'));
  }, []);

  const translate = useCallback(
    (key: string, ...args: (string | number)[]) => {
      let str = t(key, language);
      if (args.length > 0) {
        args.forEach((val, idx) => {
          str = str.replace(new RegExp(`\\{${idx}\\}`, 'g'), String(val));
        });
      }
      return str;
    },
    [language]
  );

  return { language, t: translate, setLanguage: changeLanguage };
}
