// Mirrors the backend DTOs (ISTQBuddy.Application).

export interface ProfileDto {
  id: string;
  email: string;
  displayName: string | null;
  role: "User" | "Admin";
  hasFullAccess: boolean;
}

export type CertificationCategory = "Core" | "Specialist" | "Expert" | "Other";

export interface CatalogCertificationDto {
  id: string;
  slug: string;
  name: string;
  category: CertificationCategory;
  version: string;
  examCount: number;
  hasFreeSample: boolean;
  isLocked: boolean;
  isOwned: boolean;
}

export interface CertificationDetailDto {
  id: string;
  slug: string;
  name: string;
  category: CertificationCategory;
  isOwned: boolean;
  exams: ExamSummaryDto[];
}

export interface ExamSummaryDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isFreeSample: boolean;
  questionCount: number;
  totalPoints: number;
  passPercentage: number;
  certificationName: string;
  isLocked: boolean;
}

export interface OptionDto {
  id: string;
  label: string;
  text: string;
  orderIndex: number;
  // Populated only in study mode (includeAnswers).
  isCorrect?: boolean | null;
  rationale?: string | null;
}

export interface QuestionDto {
  id: string;
  externalId: string;
  section: string;
  learningObjective: string;
  kLevel: "K1" | "K2" | "K3" | "K4";
  points: number;
  stem: string;
  diagram?: string | null;
  selectCount: number;
  orderIndex: number;
  options: OptionDto[];
}

export interface ExamDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  certificationName: string;
  certificationSlug: string;
  passPercentage: number;
  includesAnswers: boolean;
  questions: QuestionDto[];
}

export interface StartAttemptResult {
  attemptId: string;
  examId: string;
}

export interface ResultOptionDto {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  wasSelected: boolean;
  rationale: string | null;
}

export interface ResultQuestionDto {
  questionId: string;
  externalId: string;
  section: string;
  learningObjective: string;
  kLevel: "K1" | "K2" | "K3" | "K4";
  points: number;
  stem: string;
  diagram?: string | null;
  selectCount: number;
  isCorrect: boolean;
  pointsAwarded: number;
  options: ResultOptionDto[];
}

export interface AttemptResultDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passPercentage: number;
  passed: boolean;
  submittedAt: string | null;
  questions: ResultQuestionDto[];
}
