import { api } from "./axios";
import type {
  AttemptResultDto,
  CatalogCertificationDto,
  CertificationDetailDto,
  ExamDetailDto,
  ExamSummaryDto,
  ProfileDto,
  StartAttemptResult,
} from "@/types";

export const getProfile = () => api.get<ProfileDto>("/api/profile/me").then((r) => r.data);

export const getCertifications = () =>
  api.get<CatalogCertificationDto[]>("/api/certifications").then((r) => r.data);

export const getCertification = (slug: string) =>
  api.get<CertificationDetailDto>(`/api/certifications/${slug}`).then((r) => r.data);

export const getExams = () => api.get<ExamSummaryDto[]>("/api/exams").then((r) => r.data);

export const getExam = (examId: string, includeAnswers = false) =>
  api
    .get<ExamDetailDto>(`/api/exams/${examId}`, { params: { includeAnswers } })
    .then((r) => r.data);

export const startAttempt = (examId: string) =>
  api.post<StartAttemptResult>("/api/attempts", { examId }).then((r) => r.data);

export const submitAttempt = (
  attemptId: string,
  answers: { questionId: string; selectedOptionIds: string[] }[],
) =>
  api
    .post<AttemptResultDto>(`/api/attempts/${attemptId}/submit`, { answers })
    .then((r) => r.data);

export const getAttemptResult = (attemptId: string) =>
  api.get<AttemptResultDto>(`/api/attempts/${attemptId}`).then((r) => r.data);
