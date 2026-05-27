"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getExam, startAttempt, submitAttempt } from "@/lib/api";
import type { ExamDetailDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionCard } from "./question-card";
import { ProgressBar } from "./progress-bar";

type Phase = "loading" | "intro" | "running" | "locked" | "error";

export function QuizRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [exam, setExam] = useState<ExamDetailDto | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getExam(examId)
      .then((e) => {
        setExam(e);
        setPhase("intro");
      })
      .catch((err: AxiosError) => {
        setPhase(err.response?.status === 403 ? "locked" : "error");
      });
  }, [examId]);

  const answeredCount = useMemo(
    () => Object.values(selections).filter((s) => s.size > 0).length,
    [selections],
  );

  function toggleOption(question: ExamDetailDto["questions"][number], optionId: string) {
    setSelections((prev) => {
      const current = new Set(prev[question.id] ?? []);
      if (question.selectCount === 1) {
        current.clear();
        current.add(optionId);
      } else if (current.has(optionId)) {
        current.delete(optionId);
      } else if (current.size < question.selectCount) {
        current.add(optionId);
      } else {
        toast.info(`You can select up to ${question.selectCount} options.`);
        return prev;
      }
      return { ...prev, [question.id]: current };
    });
  }

  async function begin() {
    try {
      const result = await startAttempt(examId);
      setAttemptId(result.attemptId);
      setPhase("running");
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      if (status === 403) setPhase("locked");
      else toast.error("Could not start the exam.");
    }
  }

  async function finish() {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(selections).map(([questionId, opts]) => ({
        questionId,
        selectedOptionIds: [...opts],
      }));
      await submitAttempt(attemptId, answers);
      router.push(`/attempts/${attemptId}`);
    } catch {
      toast.error("Could not submit your answers.");
      setSubmitting(false);
    }
  }

  if (phase === "loading") return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (phase === "locked") {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h2 className="font-serif text-2xl font-semibold">This exam is locked</h2>
          <p className="text-muted-foreground">
            Full access unlocks all exams. Upgrades are coming soon.
          </p>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to exams</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "error" || !exam) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h2 className="font-serif text-2xl font-semibold">Something went wrong</h2>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to exams</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <Card className="animate-fade-up">
        <CardContent className="space-y-4 pt-6">
          <h1 className="font-serif text-3xl font-semibold">{exam.title}</h1>
          {exam.description && <p className="text-muted-foreground">{exam.description}</p>}
          <p className="text-sm text-muted-foreground">
            {exam.questions.length} questions · pass mark {exam.passPercentage}%. You&apos;ll see
            your score and full rationales after submitting.
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={begin}>Begin exam</Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-40 rounded-xl border border-border/60 bg-background/90 p-4 backdrop-blur">
        <ProgressBar value={answeredCount} total={exam.questions.length} />
      </div>

      {exam.questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          total={exam.questions.length}
          selected={selections[q.id] ?? new Set()}
          onToggle={(optionId) => toggleOption(q, optionId)}
        />
      ))}

      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
        <span className="text-sm text-muted-foreground">
          {answeredCount} of {exam.questions.length} answered
        </span>
        <Button onClick={finish} disabled={submitting}>
          {submitting ? "Scoring…" : "Finish & score"}
        </Button>
      </div>
    </div>
  );
}
