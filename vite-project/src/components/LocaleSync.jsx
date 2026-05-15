import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const URL_TO_LANG = { ka: "GE", en: "EN", ru: "RU" };

export default function LocaleSync() {
  const { pathname } = useLocation();
  const { lang, setLang } = useLanguage();

  // First path segment after the leading slash
  const segment = pathname.split("/").filter(Boolean)[0];
  const target = URL_TO_LANG[segment];

  useEffect(() => {
    if (target && target !== lang) setLang(target);
  }, [target, lang, setLang]);

  return <Outlet />;
}
