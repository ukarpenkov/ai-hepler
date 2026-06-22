"use client";

import { useEffect } from "react";

export default function InterviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const body = document.body;
    body.style.display = "block";
    body.style.alignItems = "";
    body.style.justifyContent = "";
    body.style.height = "100vh";
    body.style.height = "100dvh";
    return () => {
      body.style.display = "";
      body.style.alignItems = "";
      body.style.justifyContent = "";
      body.style.height = "";
    };
  }, []);

  return <>{children}</>;
}
