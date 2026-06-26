const MIN_WORD_LENGTH = 3;
const QUESTION_COVERAGE_THRESHOLD = 0.7;

export function normalizeAnswerText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeAnswerText(text)
    .split(" ")
    .filter((word) => word.length >= MIN_WORD_LENGTH);
}

export function questionCoverageInAnswer(question: string, answer: string): number {
  const questionWords = tokenize(question);
  const answerWords = new Set(tokenize(answer));

  if (questionWords.length === 0) {
    return 0;
  }

  let overlap = 0;
  for (const word of questionWords) {
    if (answerWords.has(word)) {
      overlap++;
    }
  }

  return overlap / questionWords.length;
}

export function wordOverlapRatio(question: string, answer: string): number {
  const questionWords = new Set(tokenize(question));
  const answerWords = tokenize(answer);

  if (questionWords.size === 0 || answerWords.length === 0) {
    return 0;
  }

  let overlap = 0;
  for (const word of answerWords) {
    if (questionWords.has(word)) {
      overlap++;
    }
  }

  return overlap / answerWords.length;
}

export function isParaphrasingQuestion(question: string, answer: string): boolean {
  const normalizedQuestion = normalizeAnswerText(question);
  const normalizedAnswer = normalizeAnswerText(answer);

  if (!normalizedQuestion || !normalizedAnswer) {
    return false;
  }

  if (normalizedQuestion === normalizedAnswer) {
    return true;
  }

  if (normalizedAnswer.includes(normalizedQuestion)) {
    const remainder = normalizedAnswer.replace(normalizedQuestion, "").trim();
    const minOriginalLength = Math.max(40, Math.round(normalizedQuestion.length * 0.2));
    if (remainder.length < minOriginalLength) {
      return true;
    }
  }

  if (
    normalizedQuestion.includes(normalizedAnswer) &&
    normalizedAnswer.length >= normalizedQuestion.length * 0.5
  ) {
    return true;
  }

  const coverage = questionCoverageInAnswer(question, answer);
  if (coverage >= QUESTION_COVERAGE_THRESHOLD) {
    const answerAddsLittle =
      normalizedAnswer.length <= normalizedQuestion.length * 1.15;
    if (answerAddsLittle) {
      return true;
    }
  }

  return false;
}
