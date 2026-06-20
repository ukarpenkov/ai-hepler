"use client";

import { useState } from "react";

interface JobUploadProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function JobUpload({ onSubmit, isLoading }: JobUploadProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (text.length < 50) {
      setError("Минимум 50 символов");
      return;
    }
    setError("");
    onSubmit(text);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Вставьте текст вакансии..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError("");
        }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isLoading || text.length < 50}
      >
        {isLoading ? "Загрузка..." : "Начать интервью"}
      </button>
    </div>
  );
}
