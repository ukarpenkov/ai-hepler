"use client";

import { useRef, useCallback, useEffect, useState, type PointerEvent } from "react";

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  hideThumb?: boolean;
}

export default function CustomScrollbar({ children, className = "", hideThumb = false }: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState<{ top: number; height: number } | null>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

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
    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [updateThumb]);

  const handleThumbPointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    const el = containerRef.current;
    if (el) {
      dragStartScroll.current = el.scrollTop;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleThumbPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight } = el;
    const trackHeight = clientHeight - 24;
    const ratio = trackHeight / scrollHeight;
    const h = Math.max(20, trackHeight * ratio);
    const maxTop = trackHeight - h;
    const maxScroll = scrollHeight - clientHeight;
    const delta = e.clientY - dragStartY.current;
    const scrollDelta = maxScroll > 0 ? (delta / maxTop) * maxScroll : 0;
    el.scrollTop = dragStartScroll.current + scrollDelta;
  }, []);

  const handleThumbPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className={`scroll-overlay ${className}`} ref={containerRef}>
      {children}
      {thumbStyle && !hideThumb && (
        <div className="custom-scroll-track">
          <div
            className="custom-scroll-thumb"
            style={{ top: thumbStyle.top, height: thumbStyle.height, cursor: "grab" }}
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
          />
        </div>
      )}
    </div>
  );
}
