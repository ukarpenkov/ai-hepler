"use client";

import { useEffect } from "react";

export default function InterviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const body = document.body;
    body.style.overflow = "visible";
    body.style.display = "block";
    body.style.alignItems = "";
    body.style.justifyContent = "";
    return () => {
      body.style.overflow = "";
      body.style.display = "";
      body.style.alignItems = "";
      body.style.justifyContent = "";
    };
  }, []);

  return <>{children}</>;
}
