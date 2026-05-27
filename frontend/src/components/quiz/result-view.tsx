"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAttemptResult } from "@/lib/api";
import type { AttemptResultDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ResultView({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<AttemptResultDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAttemptResult(attemptId).then(setResult).catch(() => setError(true));
  }, [attemptId]);

  if (error) return <p className="text-sm text-destructive">Could not load this result.</p>;
  if (!result) return <p className="text-sm text-muted-foreground">Loading your results…</p>;

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy to-brand-navy-deep p-8 text-white shadow-lg md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
          Examination complete
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">{result.examTitle}</h1>
        <div className="mt-5 flex items-baseline gap-2 font-serif">
          <span className="text-6xl font-bold">{result.score}</span>
          <span className="text-2xl text-white/50">/ {result.maxScore}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-white/85">
          {result.percentage}% · pass mark {result.passPercentage}% ·{" "}
          {result.passed ? "You passed 🎉" : "Keep practicing"}
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to exams</Link>
          </Button>
        </div>
      </div>

      {/* Per-question review */}
      {result.questions.map((q, i) => (
        <article
          key={q.questionId}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_rgba(27,61,122,0.06)] md:p-8"
        >
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
            <div className="font-serif text-xl font-bold text-brand-navy">Q{i + 1}</div>
            <div className="flex items-center gap-1.5">
              <Badge variant={q.isCorrect ? "green" : "red"}>
                {q.isCorrect ? "Correct" : "Incorrect"}
              </Badge>
              <Badge>{q.learningObjective}</Badge>
            </div>
          </header>

          <p className="mb-4 whitespace-pre-wrap font-serif text-lg leading-relaxed">{q.stem}</p>

          <div className="flex flex-col gap-2.5">
            {q.options.map((opt) => (
              <div
                key={opt.id}
                className={cn(
                  "rounded-xl border-[1.5px] px-4 py-3.5",
                  opt.isCorrect
                    ? "border-brand-green/40 bg-brand-green-soft"
                    : opt.wasSelected
                      ? "border-brand-red-border bg-brand-red-soft"
                      : "border-border bg-background",
                )}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      "font-serif text-lg font-bold leading-tight",
                      opt.isCorrect
                        ? "text-brand-green"
                        : opt.wasSelected
                          ? "text-brand-red"
                          : "text-muted-foreground",
                    )}
                  >
                    {opt.label})
                  </span>
                  <span className="flex-1 text-sm leading-relaxed">{opt.text}</span>
                  {opt.isCorrect && (
                    <span className="text-xs font-bold uppercase text-brand-green">Answer</span>
                  )}
                  {!opt.isCorrect && opt.wasSelected && (
                    <span className="text-xs font-bold uppercase text-brand-red">Your pick</span>
                  )}
                </div>
                {opt.rationale && (
                  <p className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">
                    {opt.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
