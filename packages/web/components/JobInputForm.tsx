"use client";

import { useState } from "react";

interface JobInputFormProps {
  onSubmit: (jobText: string) => void;
  isLoading: boolean;
}

export default function JobInputForm({ onSubmit, isLoading }: JobInputFormProps) {
  const [jobText, setJobText] = useState("");

  return (
    <div className="animate-slide-up">
      <h1 className="text-[42px] font-bold text-center mb-10 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
        AI Interview Simulator
      </h1>
      <div className="relative mb-8">
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Вставьте текст вакансии..."
          className="w-full min-h-[200px] p-5 bg-surface-card border-2 border-[var(--border)] rounded-card text-base text-content-primary resize-y transition-all duration-300 glass focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] focus:-translate-y-0.5"
        />
      </div>
      <button
        onClick={() => onSubmit(jobText)}
        disabled={isLoading}
        className="w-full py-[18px] bg-gradient-to-r from-primary to-pink-500 text-white border-none rounded-button text-lg font-semibold cursor-pointer transition-all duration-300 shadow-button relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(99,102,241,0.4)] active:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Загрузка..." : "Начать интервью"}
      </button>
    </div>
  );
}
