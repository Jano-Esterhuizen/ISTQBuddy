import { ResultView } from "@/components/quiz/result-view";

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}
