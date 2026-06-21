"use client";

interface BurgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function BurgerMenu({ isOpen, onClick }: BurgerMenuProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      className="relative w-[34px] h-[34px] cursor-pointer bg-transparent border-none p-0"
    >
      <svg
        fill="none"
        viewBox="0 0 50 50"
        height="34"
        width="34"
        className="block"
      >
        <path
          strokeLinecap="round"
          strokeWidth="6"
          stroke={isOpen ? "var(--color-primary, crimson)" : "currentColor"}
          d="M6 11L44 11"
          className="transition-all duration-500"
          style={{
            strokeDasharray: "40 40",
            strokeDashoffset: isOpen ? 0 : 25,
            transformOrigin: "left",
            transform: isOpen
              ? "rotateZ(45deg) translate(-7px, -5px)"
              : "none",
          }}
        />
        <path
          strokeLinecap="round"
          strokeWidth="6"
          stroke={isOpen ? "var(--color-primary, crimson)" : "currentColor"}
          d="M6 24H43"
          className="transition-all duration-500"
          style={{
            strokeDasharray: "40 40",
            strokeDashoffset: isOpen ? 40 : 0,
          }}
        />
        <path
          strokeLinecap="round"
          strokeWidth="6"
          stroke={isOpen ? "var(--color-primary, crimson)" : "currentColor"}
          d="M6 37H43"
          className="transition-all duration-500"
          style={{
            strokeDasharray: "40 40",
            strokeDashoffset: isOpen ? 0 : 60,
            transformOrigin: "left",
            transform: isOpen
              ? "rotateZ(-45deg) translate(-5px, 5px)"
              : "none",
          }}
        />
      </svg>
    </button>
  );
}
