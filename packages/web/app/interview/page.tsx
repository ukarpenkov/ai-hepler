"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import type { QuestionResult, SessionData } from "@/lib/types";
import type { SessionRecord } from "@/lib/session-store";
import { getSession, listSessions } from "@/lib/session-store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { useI18n } from "@/lib/i18n-context";

const MOBILE_BREAKPOINT = 768;

interface Session {
  id: string;
  title: string;
  date: string;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();

  const sessionId = searchParams.get("sessionId");
  const question = searchParams.get("question");
  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progress, setProgress] = useState({ current: 1, total: 5 });
  const [sessionData, setSessionData] = useState<SessionRecord | null>(null);

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
    listSessions()
      .then((rows) =>
        setSessions(
          rows.map((s) => ({
            id: s.id,
            title: s.jobProfile?.role ?? t.newSession,
            date: new Date(s.createdAt).toLocaleDateString("ru-RU"),
          }))
        )
      )
      .catch(() => {});
  }, [t.newSession]);

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
    router.push("/");
  }, [router]);

  const handleProgressChange = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  const handleSessionClick = useCallback(async (targetSessionId: string) => {
    if (targetSessionId === sessionId) return;
    try {
      const session = await getSession(targetSessionId);
      if (!session) return;

      const lastAssistant = [...session.history]
        .reverse()
        .find((m) => m.role === "assistant");
      if (!lastAssistant) return;

      let questionData: { question: string; topic: string; difficulty: string };
      try {
        const parsed = JSON.parse(lastAssistant.content);
        questionData = {
          question: parsed.question,
          topic: parsed.topic,
          difficulty: parsed.difficulty,
        };
      } catch {
        questionData = {
          question: lastAssistant.content,
          topic: session.jobProfile?.role ?? "",
          difficulty: "medium",
        };
      }

      const params = new URLSearchParams({
        sessionId: targetSessionId,
        question: questionData.question,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
      });

      router.push(`/interview?${params.toString()}`);
    } catch {
    }
  }, [sessionId, router]);

  if (!sessionId || !question || !topic || !difficulty) {
    return (
      <div className="flex items-center justify-center h-screen text-content-primary">
        {t.loading}
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
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} onSessionClick={handleSessionClick} />
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
          storedChatMessages={sessionData?.chatMessages}
          storedFeedbacks={sessionData?.allFeedbacks}
          onProgressChange={handleProgressChange}
        />
      </div>
    </>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-content-primary">Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
