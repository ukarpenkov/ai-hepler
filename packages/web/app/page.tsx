"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseJob, startInterview } from "@/lib/api";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import JobInputForm from "@/components/JobInputForm";
import BackgroundEffects from "@/components/BackgroundEffects";

interface Session {
  id: string;
  title: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => {});
  }, []);

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
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <Sidebar isOpen={isSidebarOpen} sessions={sessions} />
      <main
        className={`pt-[100px] px-5 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-[800px] mx-auto">
          <JobInputForm onSubmit={handleSubmit} isLoading={isLoading} />
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
