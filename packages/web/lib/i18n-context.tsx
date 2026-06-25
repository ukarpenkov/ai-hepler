"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("locale") as Locale) || "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
