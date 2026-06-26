import { describe, it, expect } from "vitest";
import {
  detectLanguageFromText,
  getLanguageName,
  normalizeLanguageCode,
  questionMatchesLanguage,
  resolveInterviewLanguage,
  resolveLanguage,
  textMatchesLanguage,
} from "../language.js";

describe("language utils", () => {
  it("normalizes language codes", () => {
    expect(normalizeLanguageCode("RU")).toBe("ru");
    expect(normalizeLanguageCode("ru-RU")).toBe("ru");
  });

  it("maps language codes to display names", () => {
    expect(getLanguageName("ru")).toBe("Russian");
    expect(getLanguageName("xx")).toBe("English");
  });

  it("detects Russian from Cyrillic-heavy text", () => {
    const text =
      "Ищем frontend-разработчика с опытом React, TypeScript и оптимизации производительности интерфейсов.";
    expect(detectLanguageFromText(text)).toBe("ru");
  });

  it("detects English from Latin-heavy text", () => {
    const text =
      "We are looking for a frontend developer with React, TypeScript, and performance optimization experience.";
    expect(detectLanguageFromText(text)).toBe("en");
  });

  it("detects Russian in mixed Russian/English tech job descriptions", () => {
    const text =
      "We are looking for a Senior Frontend Developer. Требования: опыт React, TypeScript, Redux, CI/CD, microservices. Обязанности: разработка UI, code review, ментoring команды.";
    expect(detectLanguageFromText(text)).toBe("ru");
  });

  it("resolves interview language from profile fields when LLM stored en", () => {
    expect(
      resolveInterviewLanguage(
        {
          language: "en",
          role: "Frontend Developer",
          domain: "gaming",
          skills: ["React", "TypeScript"],
          softSkills: ["коммуникация"],
          keywords: ["оптимизация", "интерфейсы"],
        },
        "Ищем frontend-разработчика с опытом React и TypeScript.",
      ),
    ).toBe("ru");
  });

  it("prefers detected non-English language when LLM returns en", () => {
    const text =
      "Требуется middle backend-разработчик. Опыт с Node.js, PostgreSQL и микросервисами.";
    expect(resolveLanguage("en", text)).toBe("ru");
  });

  it("keeps explicit non-English language from LLM", () => {
    const text = "We are hiring a backend developer.";
    expect(resolveLanguage("de", text)).toBe("de");
  });

  it("validates Russian question text", () => {
    expect(
      textMatchesLanguage(
        "Как бы вы оптимизировали React-компонент с частыми обновлениями?",
        "ru",
      ),
    ).toBe(true);
    expect(
      textMatchesLanguage(
        "How would you optimize a React component with frequent updates?",
        "ru",
      ),
    ).toBe(false);
  });

  it("validates full question payload language", () => {
    expect(
      questionMatchesLanguage(
        {
          question: "Объясните разницу между useMemo и useCallback.",
          topic: "React",
          expectedAnswerCriteria: [
            "Когда использовать useMemo",
            "Когда использовать useCallback",
          ],
        },
        "ru",
      ),
    ).toBe(true);
  });
});
