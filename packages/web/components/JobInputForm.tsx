"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface JobInputFormProps {
  onSubmit: (jobText: string) => void;
  isLoading: boolean;
}

export default function JobInputForm({ onSubmit, isLoading }: JobInputFormProps) {
  const [jobText, setJobText] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [thumbStyle, setThumbStyle] = useState<{ top: number; height: number } | null>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const updateThumb = useCallback(() => {
    const el = textareaRef.current;
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
    const el = textareaRef.current;
    if (!el) return;
    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    return () => el.removeEventListener("scroll", updateThumb);
  }, [updateThumb]);

  const handleSubmit = () => {
    if (jobText.length < 50) {
      setError("Минимум 50 символов");
      return;
    }
    setError("");
    onSubmit(jobText);
  };

  return (
    <div className="animate-slide-up">
      <h1 className="text-[30px] font-bold text-center mb-10 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
        Вставте текст вакансии.
      </h1>
      <div className="relative mb-8">
        <textarea
          ref={textareaRef}
          value={jobText}
          onChange={(e) => {
            setJobText(e.target.value);
            autoResize();
            if (error) setError("");
          }}
          placeholder="Вставьте текст вакансии..."
          className="w-full min-h-[200px] max-h-[400px] p-5 bg-surface-card border-2 border-[var(--border)] rounded-card text-base text-content-primary transition-all duration-300 glass focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-0.5 overflow-y-auto resize-none scroll-overlay"
        />
        {thumbStyle && (
          <div className="custom-scroll-track">
            <div
              className="custom-scroll-thumb"
              style={{ top: thumbStyle.top, height: thumbStyle.height }}
            />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-[5em] border-none rounded-[3em] flex justify-center items-center gap-3 bg-[#1C1A1C] cursor-pointer transition-all duration-[450ms] disabled:opacity-50 disabled:cursor-not-allowed group hover:bg-gradient-to-t hover:from-[#A47CF3] hover:to-[#683FEA] hover:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4),inset_0px_-4px_0px_0px_rgba(0,0,0,0.2),0px_0px_0px_4px_rgba(255,255,255,0.2),0px_0px_180px_0px_#9917FF] hover:-translate-y-[2px]"
      >
        <svg
          height="24"
          width="24"
          viewBox="0 0 24 24"
          fill="#AAAAAA"
          className="transition-all duration-[800ms] group-hover:fill-white group-hover:scale-125"
        >
          <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
        </svg>
        <span className="font-semibold text-base text-[#AAAAAA] transition-colors duration-[450ms] group-hover:text-white">
          {isLoading ? "Загрузка..." : "Начать интервью"}
        </span>
      </button>
    </div>
  );
}
