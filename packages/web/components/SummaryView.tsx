"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

export interface QuestionFeedback {
  number: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  analysis: string;
  improved: string;
  tips: string[];
  answer: string;
}

interface SummaryViewProps {
  feedbacks: QuestionFeedback[];
}

export default function SummaryView({ feedbacks }: SummaryViewProps) {
  const { t } = useI18n();
  const [activeQuestion, setActiveQuestion] = useState(1);

  const averageScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
  const bestScore = Math.max(...feedbacks.map((f) => f.score));
  const worstScore = Math.min(...feedbacks.map((f) => f.score));

  const active = feedbacks.find((f) => f.number === activeQuestion) || feedbacks[0];

  return (
    <div className="max-w-full overflow-hidden">
      <div
        className="border rounded-2xl p-3 sm:p-5 text-center mb-5 sm:mb-7"
        style={{
          background: "var(--success-bg)",
          borderColor: "var(--success)",
        }}
      >
        <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--success)" }}>
          {t.interviewComplete(feedbacks.length)}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-7 sm:mb-10">
        <div
          className="glass rounded-[16px] sm:rounded-[20px] p-3 sm:p-7 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="text-[40px] sm:text-[56px] font-bold mb-1 sm:mb-2"
            style={{
              background: "linear-gradient(135deg, var(--accent), #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {averageScore.toFixed(1)}
          </div>
          <div className="text-sm sm:text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
            {t.average}
          </div>
        </div>
        <div
          className="glass rounded-[16px] sm:rounded-[20px] p-3 sm:p-7 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="text-[40px] sm:text-[56px] font-bold mb-1 sm:mb-2"
            style={{
              background: "linear-gradient(135deg, var(--success), #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {bestScore}
          </div>
          <div className="text-sm sm:text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
            {t.best}
          </div>
        </div>
        <div
          className="glass rounded-[16px] sm:rounded-[20px] p-3 sm:p-7 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="text-[40px] sm:text-[56px] font-bold mb-1 sm:mb-2"
            style={{
              background: "linear-gradient(135deg, var(--danger), #f87171)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {worstScore}
          </div>
          <div className="text-sm sm:text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
            {t.worst}
          </div>
        </div>
      </div>

      <div
        className="flex gap-2 flex-wrap p-3 sm:p-5 glass rounded-xl sm:rounded-2xl mb-5 sm:mb-7"
        style={{ border: "1px solid var(--border)" }}
      >
        {feedbacks.map((f) => (
          <button
            key={f.number}
            onClick={() => setActiveQuestion(f.number)}
            className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-[10px] text-sm sm:text-lg font-medium cursor-pointer transition-all duration-300"
            style={{
              background: activeQuestion === f.number ? "var(--accent)" : "var(--bg-secondary)",
              color: activeQuestion === f.number ? "white" : "var(--text-primary)",
              border: "1px solid var(--border)",
              boxShadow:
                activeQuestion === f.number ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "none",
            }}
          >
            {t.question} {f.number}
          </button>
        ))}
      </div>

      <div
        className="glass rounded-[18px] sm:rounded-3xl p-[20px] sm:p-10 mb-5 sm:mb-7"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="flex justify-between items-center mb-5 sm:mb-7 pb-4 sm:pb-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t.question} {active.number} / {feedbacks.length}
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span
              className="text-[48px] sm:text-7xl font-bold leading-none"
              style={{
                background: "linear-gradient(135deg, var(--accent), #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {active.score}
            </span>
            <span className="text-[18px] sm:text-2xl font-medium" style={{ color: "var(--text-secondary)" }}>
              / 10
            </span>
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--accent)" }}>
            {t.yourAnswer}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <p style={{ whiteSpace: "pre-wrap" }}>{active.answer}</p>
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--success)" }}>
            {t.strengths}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            {active.strengths.length > 0 ? (
              <ul className="list-inside ml-2 sm:ml-2.5">
                {active.strengths.map((s, i) => (
                  <li key={i} className="mb-1.5 sm:mb-2.5 pl-1.5 sm:pl-2.5">
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-2xl" style={{ color: "var(--text-secondary)" }}>&#128532;</p>
            )}
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--danger)" }}>
            {t.weaknesses}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            {active.weaknesses.length > 0 ? (
              <ul className="list-inside ml-2 sm:ml-2.5">
                {active.weaknesses.map((w, i) => (
                  <li key={i} className="mb-1.5 sm:mb-2.5 pl-1.5 sm:pl-2.5">
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-2xl" style={{ color: "var(--text-secondary)" }}>&#128532;</p>
            )}
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--accent)" }}>
            {t.recommendation}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <p>{active.recommendation}</p>
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--warning)" }}>
            {t.answerAnalysis}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <p>{active.analysis}</p>
          </div>
        </div>

        <div className="mb-5 sm:mb-7">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--success)" }}>
            {t.improvedAnswer}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <p style={{ whiteSpace: "pre-wrap" }}>{active.improved}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "var(--accent)" }}>
            {t.tips}
          </h3>
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-5 leading-relaxed text-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <ul className="list-inside ml-2 sm:ml-2.5">
              {active.tips.map((t, i) => (
                <li key={i} className="mb-1.5 sm:mb-2.5 pl-1.5 sm:pl-2.5">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
