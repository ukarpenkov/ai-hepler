"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QuestionResult, EvaluationResult, CoachResult } from "@/lib/types";
import { sendAnswer } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import FeedbackCard from "./FeedbackCard";
import CustomScrollbar from "./CustomScrollbar";

const TOTAL_QUESTIONS = 10;

interface FeedbackData {
  evaluation: EvaluationResult;
  coach: CoachResult;
  questionNum: number;
}

interface ChatMessage {
  role: "user" | "assistant" | "feedback";
  content: string;
  evaluation?: EvaluationResult;
  coach?: CoachResult;
}

interface ChatWindowProps {
  sessionId: string;
  initialQuestion: QuestionResult;
  onProgressChange?: (current: number, total: number) => void;
}

export default function ChatWindow({ sessionId, initialQuestion, onProgressChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `[${initialQuestion.topic}] ${initialQuestion.question}`,
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS), TOTAL_QUESTIONS);
  }, [questionCount, onProgressChange]);

  const handleSend = useCallback(async () => {
    const answer = currentInput.trim();
    if (!answer || isLoading || isFinished) return;

    setCurrentInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setIsLoading(true);

    try {
      const response = await sendAnswer(sessionId, answer);
      const nextCount = questionCount + 1;

      const feedbackMsg: ChatMessage = {
        role: "feedback",
        content: "",
        evaluation: response.evaluation,
        coach: response.coach,
      };

      const nextQuestionMsg: ChatMessage = {
        role: "assistant",
        content: `[${response.nextQuestion.topic}] ${response.nextQuestion.question}`,
      };

      setMessages((prev) => [...prev, feedbackMsg, nextQuestionMsg]);

      setAllFeedbacks((prev) => [
        ...prev,
        {
          evaluation: response.evaluation,
          coach: response.coach,
          questionNum: questionCount,
        },
      ]);

      if (nextCount >= TOTAL_QUESTIONS) {
        setIsFinished(true);
      }

      setQuestionCount(nextCount);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Произошла ошибка. Попробуйте ещё раз." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, isFinished, sessionId, questionCount]);

  return (
    <div className="flex flex-col h-full rounded-glass border border-[var(--border)] bg-[var(--chat-bg)] backdrop-blur-glass shadow-glass overflow-hidden animate-slide-up">
      <CustomScrollbar className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-5">
        {messages.map((msg, i) => {
          if (msg.role === "feedback" && msg.evaluation && msg.coach) {
            return (
              <div
                key={i}
                className="p-4 bg-surface-card border border-[var(--border)] rounded-card backdrop-blur-[10px] shadow-[0_4px_15px_var(--shadow)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary">
                    Оценка: {msg.evaluation.score}/10
                  </span>
                </div>
                {msg.coach.tips.length > 0 && (
                  <p className="text-sm text-content-secondary">{msg.coach.tips[0]}</p>
                )}
              </div>
            );
          }
          return (
            <MessageBubble
              key={i}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </CustomScrollbar>

      <div className="p-4 sm:p-5 bg-[var(--glass-bg)] backdrop-blur-glass border-t border-[var(--border)]">
        {isFinished ? (
          <CustomScrollbar className="max-h-[60vh] overflow-y-auto space-y-4">
            <div className="text-center text-lg font-semibold text-green-600 mb-4">
              Интервью завершено! Все {TOTAL_QUESTIONS} вопросов задано.
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="p-3 bg-surface-card border border-[var(--border)] rounded-card">
                <div className="text-2xl font-bold text-primary">
                  {(
                    allFeedbacks.reduce((s, f) => s + f.evaluation.score, 0) /
                    allFeedbacks.length
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-content-secondary">Средний балл</div>
              </div>
              <div className="p-3 bg-surface-card border border-[var(--border)] rounded-card">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...allFeedbacks.map((f) => f.evaluation.score))}
                </div>
                <div className="text-sm text-content-secondary">Лучший</div>
              </div>
              <div className="p-3 bg-surface-card border border-[var(--border)] rounded-card">
                <div className="text-2xl font-bold text-red-600">
                  {Math.min(...allFeedbacks.map((f) => f.evaluation.score))}
                </div>
                <div className="text-sm text-content-secondary">Худший</div>
              </div>
            </div>

            {allFeedbacks.map((fb, i) => (
              <div key={i} className="border border-[var(--border)] rounded-card p-4">
                <h4 className="font-medium mb-2 text-content-primary">
                  Вопрос {fb.questionNum} / {TOTAL_QUESTIONS}
                </h4>
                <FeedbackCard evaluation={fb.evaluation} coach={fb.coach} />
              </div>
            ))}
          </CustomScrollbar>
        ) : (
          <div className="flex gap-3 items-end">
            <textarea
              className="flex-1 min-h-[50px] max-h-[120px] p-3.5 bg-[var(--input-bg)] border-2 border-[var(--border)] rounded-2xl text-[15px] font-[inherit] text-content-primary resize-none transition-all duration-300 backdrop-blur-[10px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-content-secondary"
              rows={1}
              placeholder="Введите ваш ответ..."
              value={currentInput}
              onChange={(e) => {
                setCurrentInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="w-[50px] h-[50px] shrink-0 bg-gradient-to-br from-primary to-pink-500 border-none rounded-button text-white text-xl cursor-pointer transition-all duration-300 flex items-center justify-center shadow-button hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_12px_25px_rgba(99,102,241,0.4)] active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSend}
              disabled={isLoading || !currentInput.trim()}
            >
              {isLoading ? "..." : "\u27A4"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
