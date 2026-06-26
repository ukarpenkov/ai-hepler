"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseJob, startInterview } from "@/lib/api";
import {
  createSession,
  updateSession,
  listSessions,
  getSession,
  type SessionRecord,
} from "@/lib/session-store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobInputForm from "@/components/JobInputForm";
import { useI18n } from "@/lib/i18n-context";

const MOBILE_BREAKPOINT = 768;

interface Session {
  id: string;
  title: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

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

  const closeSidebar = useCallback(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { jobProfile } = await parseJob(text);
      const session = await createSession();
      await updateSession(session.id, { jobProfile });
      const { question, updatedHistory } = await startInterview(session.id, {
        jobProfile,
        weakSkills: [],
        history: [],
      });
      await updateSession(session.id, {
        jobProfile,
        history: updatedHistory as SessionRecord["history"],
      });

      const params = new URLSearchParams({
        sessionId: session.id,
        question: question.question,
        topic: question.topic,
        difficulty: question.difficulty,
      });

      router.push(`/interview?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      const session = await getSession(sessionId);
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
        sessionId,
        question: questionData.question,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
      });

      router.push(`/interview?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    }
  };

  return (
    <>
      <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} onSessionClick={handleSessionClick} />
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[98] transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      <div className="max-w-[800px] w-[90%] p-10 glass rounded-[24px] relative z-[1] animate-slide-up shadow-glass">
        <JobInputForm onSubmit={handleSubmit} isLoading={isLoading} />
        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
      </div>
    </>
  );
}
