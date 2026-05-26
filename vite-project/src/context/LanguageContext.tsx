import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import en, { type TranslationKey } from '../i18n/en';
import ka from '../i18n/ka';
import ru from '../i18n/ru';

export type Lang = 'GE' | 'EN' | 'RU';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const HTML_LANG_MAP: Record<Lang, string> = { GE: 'ka', EN: 'en', RU: 'ru' };
const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = { GE: ka, EN: en, RU: ru };

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('siteLang') as Lang) || 'GE'
  );

  const setLang = (newLang: Lang) => setLangState(newLang);

  useEffect(() => {
    localStorage.setItem('siteLang', lang);
    document.documentElement.lang = HTML_LANG_MAP[lang];
  }, [lang]);

  const t = (key: TranslationKey): string => TRANSLATIONS[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
