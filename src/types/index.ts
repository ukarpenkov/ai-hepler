import { z } from "zod";

export const SessionSchema = z
  .object({
    id: z.string().uuid(),
    jobProfile: z
      .object({
        role: z.string(),
        level: z.string(),
        skills: z.array(z.string()),
        softSkills: z.array(z.string()),
        keywords: z.array(z.string()),
        domain: z.string(),
        minYearsExperience: z.number().nullable(),
      })
      .nullable(),
    history: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
      })
    ),
    weakSkills: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export type Session = z.infer<typeof SessionSchema>;

export {
  JobProfileSchema,
  QuestionSchema,
  EvaluationSchema,
  CoachSchema,
  MemoryUpdateSchema,
  validateWithSchema,
  ValidationError,
} from "../security/schemas.js";

export type {
  JobProfile,
  Question,
  Evaluation,
  Coach,
  MemoryUpdate,
} from "../security/schemas.js";
