import { z } from 'zod';

export const StageTypeSchema = z.enum([
  'CONVERSATIONAL', 
  'WHITEBOARD_REVIEW', 
  'SCENARIO_WALKTHROUGH'
]);

export const QuestionSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  needsCode: z.boolean().default(false).describe("Set to TRUE if this specific question requires the code editor/sandbox to be visible."),
  idealRubric: z.string().describe("Explicit technical elements or structures required to score highly.")
});

export const PipelineStageSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "Recruiter Screen", "Technical QA", "Whiteboard Challenge"
  type: StageTypeSchema,
  focusTechStack: z.array(z.string()).default([]),
  interviewerPersona: z.string().describe("Specific behavioral guidelines for the interviewer. E.g., 'A rigorous, detail-oriented DBA'"),
  questionPool: z.array(QuestionSchema).length(3) // Fixed at 3 core problems per stage for efficient session runtimes
});

export const PipelineBlueprintSchema = z.object({
  jobTitle: z.string(),
  companyName: z.string(),
  experienceLevel: z.string(),
  languageCode: z.string().default('en-US'),
  stages: z.array(PipelineStageSchema)
});

export const EvaluationScorecardSchema = z.object({
  overallScore: z.number().min(0).max(100),
  performanceSummary: z.string(),
  metrics: z.object({
    technicalAccuracy: z.number().min(0).max(100),
    communicationClarity: z.number().min(0).max(100),
    honestyAndHumility: z.number().min(0).max(100).describe("High marks for admitting limitations gracefully; heavily penalized for fabrications."),
    starAlignment: z.number().min(0).max(100).describe("Measures structured layout in behavioral responses.")
  }),
  strengths: z.array(z.string()).min(0).max(5),
  weaknesses: z.array(z.string()).min(0).max(5),
  localStudyPlan: z.array(z.object({
    concept: z.string(),
    reason: z.string(),
    localOllamaRefCommand: z.string().describe("A natural language prompt for the user to study this concept. E.g. 'Explain the storage layout of a clustered index...'")
  }))
});

export type EvaluationScorecard = z.infer<typeof EvaluationScorecardSchema>;
export type PipelineBlueprint = z.infer<typeof PipelineBlueprintSchema>;
export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type StageType = z.infer<typeof StageTypeSchema>;

export interface InterviewHistoryItem {
  id: string;
  timestamp: number;
  blueprint: PipelineBlueprint;
  scorecard: EvaluationScorecard;
}
