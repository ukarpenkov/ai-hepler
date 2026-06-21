"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

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
