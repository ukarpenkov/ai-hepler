"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseJob, startInterview } from "@/lib/api";
import JobUpload from "@/components/JobUpload";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">AI Interview Simulator</h1>

        <JobUpload onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
