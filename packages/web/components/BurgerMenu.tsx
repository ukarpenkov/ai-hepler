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
      className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 glass border rounded-[10px] cursor-pointer transition-all duration-300 hover:bg-primary hover:scale-105"
    >
      <span
        className={`w-5 h-0.5 bg-content-primary rounded-sm transition-all duration-300 ${
          isOpen ? "rotate-45 translate-x-[5px] translate-y-[5px]" : ""
        }`}
      />
      <span
        className={`w-5 h-0.5 bg-content-primary rounded-sm transition-all duration-300 ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`w-5 h-0.5 bg-content-primary rounded-sm transition-all duration-300 ${
          isOpen ? "-rotate-45 translate-x-[7px] -translate-y-[6px]" : ""
        }`}
      />
    </button>
  );
}
