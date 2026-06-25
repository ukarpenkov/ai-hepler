"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

interface JobUploadProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function JobUpload({ onSubmit, isLoading }: JobUploadProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (text.length < 50) {
      setError(t.minChars as string);
      return;
    }
    setError("");
    onSubmit(text);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={t.pasteJobPlaceholder as string}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError("");
        }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className="w-full h-[5em] border-none rounded-[3em] flex justify-center items-center gap-3 bg-[#1C1A1C] cursor-pointer transition-all duration-[450ms] disabled:opacity-50 disabled:cursor-not-allowed group hover:bg-gradient-to-t hover:from-[#A47CF3] hover:to-[#683FEA] hover:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4),inset_0px_-4px_0px_0px_rgba(0,0,0,0.2),0px_0px_0px_4px_rgba(255,255,255,0.2),0px_0px_180px_0px_#9917FF] hover:-translate-y-[2px]"
        onClick={handleSubmit}
        disabled={isLoading || text.length < 50}
      >
        <svg
          height="24"
          width="24"
          viewBox="0 0 24 24"
          fill="#AAAAAA"
          className="transition-all duration-[800ms] group-hover:fill-white group-hover:scale-125"
        >
          <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
        </svg>
        <span className="font-semibold text-base text-[#AAAAAA] transition-colors duration-[450ms] group-hover:text-white">
          {isLoading ? (t.loading as string) : (t.startInterview as string)}
        </span>
      </button>
    </div>
  );
}
