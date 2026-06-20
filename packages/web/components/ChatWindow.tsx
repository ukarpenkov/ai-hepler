"use client";

import { useState, useEffect, useRef } from "react";
import type { QuestionResult, EvaluationResult, CoachResult } from "@/lib/types";
import { sendAnswer } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import FeedbackCard from "./FeedbackCard";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  sessionId: string;
  initialQuestion: QuestionResult;
}

export default function ChatWindow({ sessionId, initialQuestion }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<EvaluationResult | null>(null);
  const [lastCoach, setLastCoach] = useState<CoachResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `[${initialQuestion.topic}] ${initialQuestion.question}`,
      },
    ]);
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const answer = currentInput.trim();
    if (!answer || isLoading) return;

    setCurrentInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setIsLoading(true);

    try {
      const response = await sendAnswer(sessionId, answer);

      setLastFeedback(response.evaluation);
      setLastCoach(response.coach);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `[${response.nextQuestion.topic}] ${response.nextQuestion.question}`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Произошла ошибка. Попробуйте ещё раз." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
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

        {lastFeedback && lastCoach && (
          <FeedbackCard evaluation={lastFeedback} coach={lastCoach} />
        )}
      </div>
    </div>
  );
}
