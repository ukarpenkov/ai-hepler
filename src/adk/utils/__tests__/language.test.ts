import { describe, it, expect } from "vitest";
import {
  detectLanguageFromText,
  getLanguageName,
  isEnglishRequired,
  normalizeLanguageCode,
  questionMatchesLanguage,
  resolveInterviewLanguage,
  resolveLanguage,
  resolveQuestionLanguage,
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

  it("resolves interview language from job posting text, not English skill names", () => {
    expect(
      resolveInterviewLanguage(
        {
          language: "en",
          role: "Frontend Developer",
          domain: "gaming",
          skills: ["React", "TypeScript", "Node.js"],
          softSkills: [],
          keywords: ["microservices"],
        },
        "Ищем frontend-разработчика. Требования: опыт React, TypeScript, Node.js.",
      ),
    ).toBe("ru");
  });

  it("keeps English when the job posting text is in English", () => {
    const text =
      "We are looking for a Senior Frontend Developer with React and TypeScript experience.";
    expect(resolveInterviewLanguage({ language: "ru", role: "Developer" }, text)).toBe(
      "en",
    );
    expect(detectLanguageFromText(text)).toBe("en");
  });

  it("detects English language requirement in Russian postings", () => {
    expect(
      isEnglishRequired(
        { softSkills: ["коммуникация"] },
        "Требуется менеджер. Свободный английский язык обязателен.",
      ),
    ).toBe(true);
    expect(
      isEnglishRequired(
        { softSkills: [] },
        "Инженер-проектировщик. Опыт работы с КОМПАС 3D.",
      ),
    ).toBe(false);
  });

  it("schedules English assessment questions when English is required", () => {
    expect(resolveQuestionLanguage("ru", 0, true)).toBe("ru");
    expect(resolveQuestionLanguage("ru", 1, true)).toBe("ru");
    expect(resolveQuestionLanguage("ru", 2, true)).toBe("en");
    expect(resolveQuestionLanguage("ru", 5, true)).toBe("en");
    expect(resolveQuestionLanguage("en", 2, true)).toBe("en");
    expect(resolveQuestionLanguage("ru", 2, false)).toBe("ru");
  });

  it("prefers detected non-English language when LLM returns en", () => {
    const text =
      "Требуется middle backend-разработчик. Опыт с Node.js, PostgreSQL и микросервисами.";
    expect(resolveLanguage("en", text)).toBe("ru");
  });

  it("detects German from German job posting text", () => {
    const text =
      "Wir suchen einen Backend-Entwickler mit Erfahrung in Node.js und PostgreSQL für unser Team in Berlin.";
    expect(resolveLanguage("en", text)).toBe("de");
    expect(detectLanguageFromText(text)).toBe("de");
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
