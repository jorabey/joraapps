import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { t as translate } from '../utils/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('nexa_lang') || 'uz');

  const setLang = useCallback((code) => {
    localStorage.setItem('nexa_lang', code);
    setLangState(code);
  }, []);

  const t = useCallback((key) => translate(lang, key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
