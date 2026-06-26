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

const ENGLISH_REQUIREMENT_PATTERN =
  /english\s*(language|proficiency|skills?|speaking|communication|level)|fluent\s+english|upper[- ]intermediate\s+english|advanced\s+english|english\s+b[12]|business\s+english|английск(ий|ого)\s*(язык|языка)?|знание\s+английск|english[- ]speaking|technical\s+english|опыт\s+.*английск|свободн(ый|о)\s+английск/i;

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

  if (/[äöüß]|(\b(und|der|die|das|wir|suchen|erfahrung|stellenangebot|aufgaben)\b)/i.test(
    sample,
  )) {
    return "de";
  }

  if (/(\b(nous|cherchons|expérience|poste|entreprise|français)\b)|[àâçéèêëîïôùûü]/i.test(
    sample,
  )) {
    return "fr";
  }

  if (/(\b(buscamos|experiencia|empresa|puesto|español)\b)|[áéíóúñ¿¡]/i.test(sample)) {
    return "es";
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

export function resolveLanguage(
  llmLanguage: string | undefined,
  sourceText: string,
): string {
  const trimmed = sourceText.trim();
  const detected = detectLanguageFromText(trimmed);
  const normalized = llmLanguage ? normalizeLanguageCode(llmLanguage) : "";

  if (trimmed.length >= 30) {
    return detected;
  }

  if (normalized && normalized === detected) {
    return normalized;
  }

  if (detected !== "en") {
    return detected;
  }

  if (normalized && normalized !== "en") {
    return normalized;
  }

  return normalized || "en";
}

export function resolveInterviewLanguage(
  jobProfile: InterviewLanguageSource,
  sourceText?: string,
): string {
  const trimmedSource = sourceText?.trim();
  if (trimmedSource) {
    return resolveLanguage(jobProfile.language, trimmedSource);
  }

  return resolveLanguage(
    jobProfile.language,
    buildInterviewLanguageText(jobProfile),
  );
}

export function isEnglishRequired(
  jobProfile: InterviewLanguageSource,
  sourceText?: string,
): boolean {
  const haystack = buildInterviewLanguageText(jobProfile, sourceText);
  return ENGLISH_REQUIREMENT_PATTERN.test(haystack);
}

export function resolveQuestionLanguage(
  primaryLanguage: string,
  previousQuestionCount: number,
  englishRequired: boolean,
): string {
  const primary = normalizeLanguageCode(primaryLanguage);

  if (primary === "en" || !englishRequired) {
    return primary;
  }

  if (previousQuestionCount > 0 && previousQuestionCount % 3 === 2) {
    return "en";
  }

  return primary;
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

  if (lang === "de" || lang === "fr" || lang === "es" || lang === "it" || lang === "pl") {
    return /[A-Za-zÀ-ÿ]/.test(combined);
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
