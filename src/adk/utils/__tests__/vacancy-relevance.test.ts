import { describe, it, expect } from "vitest";
import type { ParsedJob, QuestionResult } from "../../types.js";
import {
  buildAllowedTermsHaystack,
  extractForbiddenItTerms,
  filterMarketingKeywords,
  isQuestionVacancyRelevant,
} from "../vacancy-relevance.js";

const electricalProfile: ParsedJob = {
  role: "Инженер-проектировщик",
  level: "middle",
  skills: ["КОМПАС 3D", "ЕСКД", "электрические схемы Э3"],
  softSkills: [],
  keywords: ["щиты управления", "освещение", "до 1000В"],
  domain: "electrical equipment manufacturing",
  language: "ru",
  minYearsExperience: 3,
};

const itProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Python", "AWS", "microservices"],
  softSkills: [],
  keywords: ["cloud"],
  domain: "fintech",
  language: "en",
  minYearsExperience: 3,
};

describe("vacancy-relevance", () => {
  it("flags AWS/Python microservices question for electrical design engineer", () => {
    const question: QuestionResult = {
      question:
        "Как бы вы организовали микросервисную архитектуру на Python для сбора данных с датчиков и отправки логов в AWS?",
      topic: "Python, AWS",
      difficulty: "hard",
      questionType: "system_design",
      expectedAnswerCriteria: ["Микросервисы", "AWS Lambda"],
    };

    expect(isQuestionVacancyRelevant(question, electricalProfile)).toBe(false);
    const haystack = buildAllowedTermsHaystack(electricalProfile);
    expect(extractForbiddenItTerms(question.question, haystack)).toContain(
      "AWS",
    );
  });

  it("accepts КОМПАС/ЕСКД question for electrical design engineer", () => {
    const question: QuestionResult = {
      question:
        "На производстве обнаружили расхождение между Э3 и фактической сборкой щита освещения — какие шаги предпримете и как оформите документацию по ЕСКД?",
      topic: "ЕСКД, Э3, КОМПАС 3D",
      difficulty: "medium",
      questionType: "debugging_scenario",
      expectedAnswerCriteria: [
        "Сверка с принципиальной схемой",
        "Оформление извещения",
      ],
    };

    expect(isQuestionVacancyRelevant(question, electricalProfile)).toBe(true);
  });

  it("allows AWS question for IT vacancy", () => {
    const question: QuestionResult = {
      question: "How would you design fault-tolerant microservices on AWS?",
      topic: "AWS, microservices",
      difficulty: "hard",
      questionType: "system_design",
      expectedAnswerCriteria: ["Multi-AZ", "Circuit breaker"],
    };

    expect(isQuestionVacancyRelevant(question, itProfile)).toBe(true);
  });

  it("filters marketing-only keywords", () => {
    expect(
      filterMarketingKeywords([
        "щиты управления",
        "инновационный подход с ИИ",
        "R&D center",
      ]),
    ).toEqual(["щиты управления"]);
  });
});
