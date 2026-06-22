"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import type { QuestionResult, SessionData } from "@/lib/types";
import { getSession } from "@/lib/session-store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

const MOBILE_BREAKPOINT = 768;

interface Session {
  id: string;
  title: string;
  date: string;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");
  const question = searchParams.get("question");
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progress, setProgress] = useState({ current: 1, total: 10 });
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiBase}/sessions`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setSessions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId).then(setSessionData);
  }, [sessionId]);

  const handleClose = useCallback(() => {
    if (confirm("Вы уверены, что хотите завершить интервью?")) {
      router.push("/");
    }
  }, [router]);

  const handleProgressChange = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  if (!sessionId || !question || !topic || !difficulty) {
    return (
      <div className="flex items-center justify-center h-screen text-content-primary">
        Загрузка...
      </div>
    );
  }

  const initialQuestion: QuestionResult = {
    question,
    topic,
    difficulty: difficulty as QuestionResult["difficulty"],
  };

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        progress={progress.current}
        totalQuestions={progress.total}
        onClose={handleClose}
      />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} />
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[98] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="fixed top-[70px] sm:top-[80px] left-[10px] right-[10px] bottom-[90px] sm:left-5 sm:right-5 sm:bottom-5 z-[1] sm:rounded-glass rounded-[18px]">
        <ChatWindow
          sessionId={sessionId}
          initialQuestion={initialQuestion}
          sessionData={sessionData ?? undefined}
          onProgressChange={handleProgressChange}
        />
      </div>
    </>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-content-primary">Загрузка...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
