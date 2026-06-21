"use client";

import { useState, useCallback } from "react";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

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
