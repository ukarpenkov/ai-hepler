"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative w-[60px] h-8 rounded-2xl glass border cursor-pointer transition-all duration-300"
    >
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <span
        className={`absolute top-[3px] w-[26px] h-[26px] rounded-full bg-primary shadow-md transition-all duration-300 ${
          theme === "light" ? "left-[3px]" : "left-[31px]"
        }`}
      />
    </button>
  );
}
