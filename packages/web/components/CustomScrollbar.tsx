"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
}

export default function CustomScrollbar({ children, className = "" }: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState<{ top: number; height: number } | null>(null);

  const updateThumb = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumbStyle(null);
      return;
    }
    const trackHeight = clientHeight - 24;
    const ratio = trackHeight / scrollHeight;
    const h = Math.max(20, trackHeight * ratio);
    const maxTop = trackHeight - h;
    const maxScroll = scrollHeight - clientHeight;
    const top = maxScroll > 0 ? (scrollTop / maxScroll) * maxTop : 0;
    setThumbStyle({ top, height: h });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const observer = new MutationObserver(updateThumb);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      el.removeEventListener("scroll", updateThumb);
      observer.disconnect();
    };
  }, [updateThumb]);

  return (
    <div className={`scroll-overlay ${className}`} ref={containerRef}>
      {children}
      {thumbStyle && (
        <div className="custom-scroll-track">
          <div
            className="custom-scroll-thumb"
            style={{ top: thumbStyle.top, height: thumbStyle.height }}
          />
        </div>
      )}
    </div>
  );
}
