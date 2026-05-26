import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useLanguage, type Lang } from '../context/LanguageContext';

const URL_TO_LANG: Record<string, Lang> = { ka: 'GE', en: 'EN', ru: 'RU' };

export default function LocaleSync() {
  const { pathname } = useLocation();
  const { lang, setLang } = useLanguage();
  const segment = pathname.split('/').filter(Boolean)[0];
  const target = URL_TO_LANG[segment];

  useEffect(() => {
    if (target && target !== lang) setLang(target);
  }, [target, lang, setLang]);

  return <Outlet />;
}
