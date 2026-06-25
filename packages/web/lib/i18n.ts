export type Locale = "ru" | "en";

export interface Translations {
  newSession: string;
  error: string;
  sessionHistory: string;
  pasteJobTitle: string;
  pasteJobPlaceholder: string;
  minChars: string;
  loading: string;
  startInterview: string;
  score: string;
  interviewResults: string;
  interviewComplete: (n: number) => string;
  average: string;
  best: string;
  worst: string;
  question: string;
  yourAnswer: string;
  strengths: string;
  weaknesses: string;
  recommendation: string;
  answerAnalysis: string;
  improvedAnswer: string;
  tips: string;
  answerPlaceholder: string;
  interviewFinished: string;
  closeChat: string;
  errorPrefix: string;
  unknownError: string;
}

export const translations: Record<Locale, Translations> = {
  ru: {
    newSession: "Новая сессия",
    error: "Произошла ошибка",
    sessionHistory: "История сессий",
    pasteJobTitle: "Вставьте текст вакансии.",
    pasteJobPlaceholder: "Вставьте текст вакансии...",
    minChars: "Минимум 50 символов",
    loading: "Загрузка...",
    startInterview: "Начать интервью",
    score: "Оценка",
    interviewResults: "Результаты интервью",
    interviewComplete: (n) => `Интервью завершено! Все ${n} вопросов задано.`,
    average: "Средний",
    best: "Лучший",
    worst: "Худший",
    question: "Вопрос",
    yourAnswer: "Ваш ответ",
    strengths: "Сильные стороны",
    weaknesses: "Слабые стороны",
    recommendation: "Рекомендация",
    answerAnalysis: "Разбор ответа",
    improvedAnswer: "Улучшенный ответ",
    tips: "Советы",
    answerPlaceholder: "Введите ваш ответ... (Enter — отправить, Shift+Enter — перенос строки)",
    interviewFinished: "Интервью завершено",
    closeChat: "Закрыть чат",
    errorPrefix: "Ошибка:",
    unknownError: "Неизвестная ошибка",
  },
  en: {
    newSession: "New session",
    error: "An error occurred",
    sessionHistory: "Session history",
    pasteJobTitle: "Paste the job description.",
    pasteJobPlaceholder: "Paste the job description...",
    minChars: "Minimum 50 characters",
    loading: "Loading...",
    startInterview: "Start interview",
    score: "Score",
    interviewResults: "Interview results",
    interviewComplete: (n) => `Interview complete! All ${n} questions asked.`,
    average: "Average",
    best: "Best",
    worst: "Worst",
    question: "Question",
    yourAnswer: "Your answer",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    recommendation: "Recommendation",
    answerAnalysis: "Answer analysis",
    improvedAnswer: "Improved answer",
    tips: "Tips",
    answerPlaceholder: "Type your answer... (Enter to send, Shift+Enter for new line)",
    interviewFinished: "Interview finished",
    closeChat: "Close chat",
    errorPrefix: "Error:",
    unknownError: "Unknown error",
  },
};
