"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { QuestionResult, EvaluationResult, CoachResult } from "@/lib/types";
import { sendAnswer } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import FeedbackCard from "./FeedbackCard";
import ProgressBar from "./ProgressBar";
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
}

export default function ChatWindow({ sessionId, initialQuestion }: ChatWindowProps) {
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <ProgressBar
          current={Math.min(questionCount, TOTAL_QUESTIONS)}
          total={TOTAL_QUESTIONS}
        />
      </div>

      <CustomScrollbar className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => {
          if (msg.role === "feedback" && msg.evaluation && msg.coach) {
            return (
              <div
                key={i}
                className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-700">
                    Оценка: {msg.evaluation.score}/10
                  </span>
                </div>
                {msg.coach.tips.length > 0 && (
                  <p className="text-sm text-gray-600">{msg.coach.tips[0]}</p>
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

      <div className="border-t p-4">
        {isFinished ? (
          <CustomScrollbar className="max-h-[60vh] overflow-y-auto space-y-4">
            <div className="text-center text-lg font-semibold text-green-700 mb-4">
              Интервью завершено! Все {TOTAL_QUESTIONS} вопросов задано.
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(
                    allFeedbacks.reduce((s, f) => s + f.evaluation.score, 0) /
                    allFeedbacks.length
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Средний балл</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...allFeedbacks.map((f) => f.evaluation.score))}
                </div>
                <div className="text-sm text-gray-500">Лучший</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Math.min(...allFeedbacks.map((f) => f.evaluation.score))}
                </div>
                <div className="text-sm text-gray-500">Худший</div>
              </div>
            </div>

            {allFeedbacks.map((fb, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-gray-700">
                  Вопрос {fb.questionNum} / {TOTAL_QUESTIONS}
                </h4>
                <FeedbackCard evaluation={fb.evaluation} coach={fb.coach} />
              </div>
            ))}
          </CustomScrollbar>
        ) : (
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Введите ответ..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={isLoading || !currentInput.trim()}
            >
              {isLoading ? "..." : "Отправить"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
