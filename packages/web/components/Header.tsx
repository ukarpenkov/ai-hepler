"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import BurgerMenu from "./BurgerMenu";

interface HeaderProps {
  isSidebarOpen: boolean;
  onMenuToggle: () => void;
  progress?: number;
  totalQuestions?: number;
  onClose?: () => void;
}

function LogoSvg() {
  return (
    <svg width="44" height="44" viewBox="0 0 797 802" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-11 md:h-11">
      <path d="M398 18C610 18 783 191 783 402C783 613 610 786 398 786C309 786 222 770.5 155 720.5L73 760C58 769 41 755 46 737L68 652C39 592 22 525 22 452C22 211 196 18 398 18Z" fill="url(#paint0_linear)" />
      <path d="M320 380C379.647 380 428 331.647 428 272C428 212.353 379.647 164 320 164C260.353 164 212 212.353 212 272C212 331.647 260.353 380 320 380Z" fill="#F4F4F4" />
      <path d="M116 545C116 474 173 417 244 417H368C439 417 496 474 496 545V605C496 644 464 675 425 675H187C148 675 116 644 116 605V545Z" fill="#F4F4F4" />
      <path d="M696 251H512C499.297 251 489 261.297 489 274C489 286.703 499.297 297 512 297H696C708.703 297 719 286.703 719 274C719 261.297 708.703 251 696 251Z" fill="#F4F4F4" />
      <path d="M611 334H512C499.297 334 489 344.297 489 357C489 369.703 499.297 380 512 380H611C623.703 380 634 369.703 634 357C634 344.297 623.703 334 611 334Z" fill="#F4F4F4" />
      <defs>
        <linearGradient id="paint0_linear" x1="120" y1="650" x2="700" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A63FF" />
          <stop offset="1" stopColor="#2D8CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Header({ isSidebarOpen, onMenuToggle, progress, totalQuestions, onClose }: HeaderProps) {
  const router = useRouter();
  const hasProgress = progress !== undefined && totalQuestions !== undefined;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-[var(--border)] px-3 py-3 md:px-6 md:py-4 flex justify-between items-center gap-3 md:gap-5">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <BurgerMenu isOpen={isSidebarOpen} onClick={onMenuToggle} />
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 md:gap-3 cursor-pointer bg-transparent border-none p-0 ml-2 md:ml-4"
        >
          <LogoSvg />
          <span className="text-[1.875rem] font-semibold text-content-primary hidden md:inline" style={{ fontFamily: "var(--font-black-ops-one)" }}>
            HireChat
          </span>
        </button>
        {hasProgress && (
          <div className="hidden sm:flex flex-1 max-w-[400px] items-center gap-3 ml-4">
            <div className="flex-1 h-2 bg-surface-card border border-[var(--border)] rounded-[10px] overflow-hidden">
              <div
                className="h-full rounded-[10px] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-[length:200%_100%] animate-[gradientShift_3s_ease_infinite] transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${(progress / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-[13px] font-semibold text-content-secondary min-w-[50px] text-right">
              {progress}/{totalQuestions}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            title="Закрыть чат"
            className="w-10 h-10 flex items-center justify-center bg-surface-card border border-[var(--border)] rounded-card backdrop-blur-[10px] cursor-pointer transition-all duration-300 text-content-primary hover:bg-red-500 hover:text-white hover:scale-105 hover:rotate-90 hover:border-transparent"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
