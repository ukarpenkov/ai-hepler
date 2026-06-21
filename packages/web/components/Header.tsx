"use client";

import ThemeToggle from "./ThemeToggle";
import BurgerMenu from "./BurgerMenu";

interface HeaderProps {
  isSidebarOpen: boolean;
  onMenuToggle: () => void;
}

export default function Header({ isSidebarOpen, onMenuToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-[var(--border)] px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <BurgerMenu isOpen={isSidebarOpen} onClick={onMenuToggle} />
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-lg shadow-lg shadow-primary/30">
          AI
        </div>
        <span className="text-xl font-semibold text-content-primary">
          AI Interview
        </span>
      </div>
      <div className="flex items-center gap-5">
        <ThemeToggle />
      </div>
    </header>
  );
}
