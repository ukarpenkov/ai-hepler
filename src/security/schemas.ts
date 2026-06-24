import { z } from "zod";

export const JobProfileSchema = z
  .object({
    role: z.string().min(1),
    level: z.enum(["junior", "middle", "senior"]),
    skills: z.array(z.string()),
    softSkills: z.array(z.string()),
    domain: z.string().min(1),
    keywords: z.array(z.string()),
    minYearsExperience: z.number().int().positive().nullable(),
  })
  .strict();

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    topic: z.string().min(1),
    difficulty: z.number().int().min(1).max(10),
  })
  .strict();

export const EvaluationSchema = z
  .object({
    score: z.number().int().min(1).max(10),
    accuracy: z.number().int().min(0).max(3),
    depth: z.number().int().min(0).max(3),
    relevance: z.number().int().min(0).max(2),
    examples: z.number().int().min(0).max(2),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendation: z.string().min(1),
    antiCheatFlags: z.array(z.string()),
    perfectAnswerSummary: z.string().min(1),
  })
  .strict();

export const CoachSchema = z
  .object({
    explanation: z.string().min(1),
    improvedAnswer: z.string().min(1),
    tips: z.array(z.string()),
  })
  .strict();

export const MemoryUpdateSchema = z
  .object({
    weakTopics: z.array(z.string()),
    removeTopics: z.array(z.string()),
  })
  .strict();

export type JobProfile = z.infer<typeof JobProfileSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;
export type Coach = z.infer<typeof CoachSchema>;
export type MemoryUpdate = z.infer<typeof MemoryUpdateSchema>;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new ValidationError(`Validation failed: ${issues}`);
  }
  return result.data;
}
