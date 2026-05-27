import { QuizRunner } from "@/components/quiz/quiz-runner";

export default async function ExamRunnerPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <QuizRunner examId={examId} />;
}
