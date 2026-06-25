"use client";

import { useI18n } from "@/lib/i18n-context";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "ru" | "en")}
      className="px-2 py-1.5 text-xs font-semibold bg-surface-card border border-[var(--border)] rounded-lg cursor-pointer text-content-primary focus:outline-none focus:border-primary"
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="ru">RU</option>
    </select>
  );
}
