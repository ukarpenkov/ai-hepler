"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { QuestionResult } from "@/lib/types";
import ChatWindow from "@/components/ChatWindow";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");
  const question = searchParams.get("question");
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
    }
  }, [sessionId, router]);

  if (!sessionId || !question || !topic || !difficulty) {
    return null;
  }

  const initialQuestion: QuestionResult = {
    question,
    topic,
    difficulty: difficulty as QuestionResult["difficulty"],
  };

  return (
    <div className="h-screen flex flex-col">
      <ChatWindow sessionId={sessionId} initialQuestion={initialQuestion} />
    </div>
  );
}
