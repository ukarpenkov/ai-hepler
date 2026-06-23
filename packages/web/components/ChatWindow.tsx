"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QuestionResult, EvaluationResult, CoachResult, SessionData } from "@/lib/types";
import type { SessionRecord } from "@/lib/session-store";
import { sendAnswer } from "@/lib/api";
import { updateSession } from "@/lib/session-store";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import CustomScrollbar from "./CustomScrollbar";
import BottomSheet from "./BottomSheet";
import SummaryView from "./SummaryView";
import type { QuestionFeedback } from "./SummaryView";

const TOTAL_QUESTIONS = 1;

interface FeedbackData {
  evaluation: EvaluationResult;
  coach: CoachResult;
  questionNum: number;
}

interface ChatMessage {
  role: "user" | "assistant" | "feedback";
  content: string;
  topic?: string;
  evaluation?: EvaluationResult;
  coach?: CoachResult;
}

interface ChatWindowProps {
  sessionId: string;
  initialQuestion: QuestionResult;
  sessionData?: SessionData;
  onProgressChange?: (current: number, total: number) => void;
}

export default function ChatWindow({ sessionId, initialQuestion, sessionData, onProgressChange }: ChatWindowProps) {
  const [currentSessionData, setCurrentSessionData] = useState(sessionData);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: initialQuestion.question,
      topic: initialQuestion.topic,
    },
  ]);

  useEffect(() => {
    if (sessionData) {
      setCurrentSessionData(sessionData);
    }
  }, [sessionData]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackData[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputThumbStyle, setInputThumbStyle] = useState<{ top: number; height: number } | null>(null);
  const inputDragging = useRef(false);
  const inputDragStartY = useRef(0);
  const inputDragStartScroll = useRef(0);

  const updateInputThumb = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setInputThumbStyle(null);
      return;
    }
    const trackHeight = clientHeight - 16;
    const ratio = trackHeight / scrollHeight;
    const h = Math.max(16, trackHeight * ratio);
    const maxTop = trackHeight - h;
    const maxScroll = scrollHeight - clientHeight;
    const top = maxScroll > 0 ? (scrollTop / maxScroll) * maxTop : 0;
    setInputThumbStyle({ top, height: h });
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    updateInputThumb();
    el.addEventListener("scroll", updateInputThumb, { passive: true });
    return () => el.removeEventListener("scroll", updateInputThumb);
  }, [updateInputThumb]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onProgressChange?.(Math.min(questionCount, TOTAL_QUESTIONS), TOTAL_QUESTIONS);
  }, [questionCount, onProgressChange]);

  const handleSend = useCallback(async () => {
    const answer = currentInput.trim();
    if (!answer || isLoading || isFinished || !currentSessionData?.jobProfile) return;

    setCurrentInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setIsLoading(true);

    try {
      const response = await sendAnswer(sessionId, answer, {
        jobProfile: currentSessionData!.jobProfile!,
        weakSkills: currentSessionData!.weakSkills,
        history: currentSessionData!.history,
      });

      await updateSession(sessionId, {
        history: response.updatedHistory as SessionRecord["history"],
        weakSkills: response.updatedWeakSkills,
      });

      setCurrentSessionData((prev) => ({
        id: prev!.id,
        jobProfile: prev?.jobProfile ?? null,
        history: response.updatedHistory as SessionRecord["history"],
        weakSkills: response.updatedWeakSkills,
        createdAt: prev!.createdAt,
        updatedAt: new Date().toISOString(),
      }));

      const nextCount = questionCount + 1;

      const feedbackMsg: ChatMessage = {
        role: "feedback",
        content: "",
        evaluation: response.evaluation,
        coach: response.coach,
      };

      const nextQuestionMsg: ChatMessage | null =
        nextCount < TOTAL_QUESTIONS
          ? { role: "assistant", content: response.nextQuestion.question, topic: response.nextQuestion.topic }
          : null;

      setMessages((prev) => [...prev, feedbackMsg, ...(nextQuestionMsg ? [nextQuestionMsg] : [])]);

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
        setIsSummaryOpen(true);
      }

      setQuestionCount(nextCount);
    } catch (err) {
      console.error("sendAnswer error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Ошибка: ${err instanceof Error ? err.message : "Неизвестная ошибка"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, isFinished, sessionId, questionCount, currentSessionData]);

  const summaryFeedbacks: QuestionFeedback[] = allFeedbacks.map((fb) => ({
    number: fb.questionNum,
    score: fb.evaluation.score,
    strengths: fb.evaluation.strengths,
    weaknesses: fb.evaluation.weaknesses,
    recommendation: fb.evaluation.recommendation,
    analysis: fb.coach.explanation,
    improved: fb.coach.improvedAnswer,
    tips: fb.coach.tips,
  }));

  return (
    <div className="flex flex-col h-full w-full rounded-[18px] sm:rounded-glass border border-[var(--border)] bg-[var(--chat-bg)] backdrop-blur-glass shadow-glass overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <CustomScrollbar className="flex-1 min-h-0" contentClassName="p-[15px] sm:p-5 md:p-7 flex flex-col gap-4 sm:gap-5" hideThumb={isFinished && isSummaryOpen}>
        {messages.map((msg, i) => {
          if (msg.role === "feedback" && msg.evaluation && msg.coach) {
            return (
              <div
                key={i}
                className="p-3 sm:p-4 bg-surface-card border border-[var(--border)] rounded-card backdrop-blur-[10px] shadow-[0_4px_15px_var(--shadow)] max-w-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    Оценка: {msg.evaluation.score}/10
                  </span>
                </div>
                {msg.coach.tips.length > 0 && (
                  <p className="text-xs sm:text-sm text-content-secondary break-words">{msg.coach.tips[0]}</p>
                )}
              </div>
            );
          }
          return (
            <MessageBubble
              key={i}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
              topic={msg.topic}
            />
          );
        })}
        {isLoading && <TypingIndicator />}
        {isFinished && <div className="h-16" />}
        <div ref={messagesEndRef} />
      </CustomScrollbar>
      </div>

      {!isFinished && (
        <div className="shrink-0 p-4 sm:p-5 md:p-6 bg-[var(--glass-bg)] backdrop-blur-glass border-t border-[var(--border)]">
          <div className="flex gap-3 items-end">
            <div className="relative flex-1 min-h-[50px] max-h-[120px]">
              <textarea
                ref={textareaRef}
                className="scrollbar-hidden w-full h-full min-h-[50px] max-h-[120px] p-4 pr-5 sm:p-4 sm:pr-5 bg-[var(--input-bg)] border-2 border-[var(--border)] rounded-2xl text-[15px] font-[inherit] text-content-primary resize-none transition-all duration-300 backdrop-blur-[10px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-content-secondary"
                rows={1}
                placeholder="Введите ваш ответ..."
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  requestAnimationFrame(() => updateInputThumb());
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
              {inputThumbStyle && (
                <div className="absolute top-2 right-1 bottom-2 w-[4px] pointer-events-none z-10">
                  <div
                    className="custom-scroll-thumb !w-[4px]"
                    style={{ top: inputThumbStyle.top, height: inputThumbStyle.height, cursor: "grab" }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      inputDragging.current = true;
                      inputDragStartY.current = e.clientY;
                      const el = textareaRef.current;
                      if (el) inputDragStartScroll.current = el.scrollTop;
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={(e) => {
                      if (!inputDragging.current) return;
                      const el = textareaRef.current;
                      if (!el) return;
                      const { scrollHeight, clientHeight } = el;
                      const trackHeight = clientHeight - 16;
                      const ratio = trackHeight / scrollHeight;
                      const h = Math.max(16, trackHeight * ratio);
                      const maxTop = trackHeight - h;
                      const maxScroll = scrollHeight - clientHeight;
                      const delta = e.clientY - inputDragStartY.current;
                      const scrollDelta = maxScroll > 0 ? (delta / maxTop) * maxScroll : 0;
                      el.scrollTop = inputDragStartScroll.current + scrollDelta;
                    }}
                    onPointerUp={() => { inputDragging.current = false; }}
                  />
                </div>
              )}
            </div>
            <button
              className="w-[50px] h-[50px] shrink-0 bg-gradient-to-br from-primary to-pink-500 border-none rounded-[14px] text-white text-xl cursor-pointer transition-all duration-300 flex items-center justify-center shadow-button hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_12px_25px_rgba(99,102,241,0.4)] active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSend}
              disabled={isLoading || !currentInput.trim()}
            >
              {isLoading ? "..." : "\u27A4"}
            </button>
          </div>
        </div>
      )}

      {isFinished && (
        <BottomSheet
          isOpen={isSummaryOpen}
          onToggle={() => setIsSummaryOpen((prev) => !prev)}
          title="Результаты интервью"
        >
          <SummaryView feedbacks={summaryFeedbacks} />
        </BottomSheet>
      )}
    </div>
  );
}
