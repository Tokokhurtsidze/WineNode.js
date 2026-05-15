import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

const HTML_LANG_MAP = { GE: "ka", EN: "en", RU: "ru" };

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem("siteLang") || "GE");

  useEffect(() => {
    localStorage.setItem("siteLang", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = HTML_LANG_MAP[lang] || "ka";
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);