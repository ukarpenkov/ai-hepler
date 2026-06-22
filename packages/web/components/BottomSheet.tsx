"use client";

import { useState, useRef, useCallback, type ReactNode, type PointerEvent } from "react";
import CustomScrollbar from "./CustomScrollbar";

interface BottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onToggle, title, children }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    setIsDragging(true);
    setDragDelta(0);
    dragStartY.current = e.clientY;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientY - dragStartY.current;
      setDragDelta(delta);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "";
    }
    const threshold = 80;
    if (isOpen && dragDelta < -threshold) {
      onToggle();
    } else if (!isOpen && dragDelta > threshold) {
      onToggle();
    }
    setIsDragging(false);
    setDragDelta(0);
  }, [isOpen, dragDelta, onToggle]);

  const closedHeight = 64;
  const dynamicHeight = isOpen
    ? `calc(100% + ${Math.min(0, dragDelta)}px)`
    : `${closedHeight + Math.max(0, dragDelta)}px`;

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: dynamicHeight,
        background: "var(--glass-bg)",
        backdropFilter: "blur(30px)",
        borderTop: "1px solid var(--border)",
        transition: isDragging ? "none" : "height 0.3s ease-in-out",
      }}
    >
      <div
        className="flex flex-col items-center cursor-grab select-none"
        style={{ height: closedHeight }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={!isDragging ? onToggle : undefined}
        role="button"
        aria-label={title}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--text-secondary)" }} />
        </div>
        <span className="pb-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {title}
        </span>
      </div>
      {isOpen && (
        <div style={{ height: `calc(100% - ${closedHeight}px)` }}>
          <CustomScrollbar className="h-full">
            <div className="p-[15px] sm:p-[30px]">{children}</div>
          </CustomScrollbar>
        </div>
      )}
    </div>
  );
}
