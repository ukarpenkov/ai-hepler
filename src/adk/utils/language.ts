export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  de: "German",
  fr: "French",
  es: "Spanish",
  zh: "Chinese",
  uk: "Ukrainian",
  pl: "Polish",
  pt: "Portuguese",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
};

export function normalizeLanguageCode(code: string): string {
  return code.trim().toLowerCase().split(/[-_]/)[0];
}

export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[normalizeLanguageCode(code)] || "English";
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) || []).length;
}

export function detectLanguageFromText(text: string): string {
  const sample = text.slice(0, 4000);
  const cyrillic = countMatches(sample, /[\u0400-\u04FF]/g);
  const latin = countMatches(sample, /[A-Za-z]/g);
  const cjk = countMatches(sample, /[\u4E00-\u9FFF]/g);
  const korean = countMatches(sample, /[\uAC00-\uD7AF]/g);
  const japaneseKana = countMatches(sample, /[\u3040-\u30FF]/g);
  const letterTotal = cyrillic + latin + cjk + korean + japaneseKana;

  if (letterTotal === 0) return "en";

  if (korean >= 8 && korean >= cyrillic && korean / letterTotal >= 0.15) {
    return "ko";
  }
  if (japaneseKana >= 8 && (japaneseKana + cjk) / letterTotal >= 0.15) {
    return "ja";
  }
  if (cjk >= 8 && cjk / letterTotal >= 0.15) return "zh";

  if (cyrillic >= 5) {
    const cyrillicRatio = cyrillic / (cyrillic + latin);
    if (cyrillicRatio >= 0.08 || cyrillic >= 15) return "ru";
  }

  return "en";
}

export interface InterviewLanguageSource {
  language?: string;
  role?: string;
  domain?: string;
  keywords?: string[];
  softSkills?: string[];
  skills?: string[];
}

export function buildInterviewLanguageText(
  jobProfile: InterviewLanguageSource,
  sourceText?: string,
): string {
  return [
    sourceText ?? "",
    jobProfile.role ?? "",
    jobProfile.domain ?? "",
    ...(jobProfile.keywords ?? []),
    ...(jobProfile.softSkills ?? []),
    ...(jobProfile.skills ?? []),
  ].join(" ");
}

export function resolveInterviewLanguage(
  jobProfile: InterviewLanguageSource,
  sourceText?: string,
): string {
  const combinedText = buildInterviewLanguageText(jobProfile, sourceText);
  return resolveLanguage(jobProfile.language, combinedText);
}

export function resolveLanguage(
  llmLanguage: string | undefined,
  sourceText: string,
): string {
  const detected = detectLanguageFromText(sourceText);
  const normalized = llmLanguage ? normalizeLanguageCode(llmLanguage) : "";

  if (normalized && normalized !== "en") {
    return normalized;
  }

  if (detected !== "en") {
    return detected;
  }

  return normalized || "en";
}

export function textMatchesLanguage(text: string, language: string): boolean {
  const lang = normalizeLanguageCode(language);
  const combined = text.trim();
  if (!combined) return false;

  if (lang === "ru" || lang === "uk") {
    return /[\u0400-\u04FF]/.test(combined);
  }

  if (lang === "zh") {
    return /[\u4E00-\u9FFF]/.test(combined);
  }

  if (lang === "ja") {
    return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(combined);
  }

  if (lang === "ko") {
    return /[\uAC00-\uD7AF]/.test(combined);
  }

  if (lang === "en") {
    return /[A-Za-z]/.test(combined);
  }

  return true;
}

export function questionMatchesLanguage(
  question: QuestionLike,
  language: string,
): boolean {
  return textMatchesLanguage(question.question, language);
}

interface QuestionLike {
  question: string;
  topic: string;
  expectedAnswerCriteria: string[];
}
