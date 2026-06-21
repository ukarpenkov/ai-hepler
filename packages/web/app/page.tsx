"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseJob, startInterview } from "@/lib/api";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobInputForm from "@/components/JobInputForm";

const MOBILE_BREAKPOINT = 768;

interface Session {
  id: string;
  title: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiBase}/sessions`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setSessions)
      .catch(() => {});
  }, []);

  const closeSidebar = useCallback(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { sessionId } = await parseJob(text);
      const { question } = await startInterview(sessionId);

      const params = new URLSearchParams({
        sessionId,
        question: question.question,
        topic: question.topic,
        difficulty: question.difficulty,
      });

      router.push(`/interview?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header isSidebarOpen={isSidebarOpen} onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} />
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
