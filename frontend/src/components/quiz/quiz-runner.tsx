"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getExam, startAttempt, submitAttempt } from "@/lib/api";
import type { AttemptResultDto, ExamDetailDto, QuestionDto } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionCard } from "./question-card";

type Phase = "loading" | "intro" | "running" | "locked" | "error";
type KFilter = "all" | "K1" | "K2" | "K3" | "K4";

function setsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

/** Chapter number from a learning objective, e.g. "TA-1.3.6" or "FL-2.1.1" -> "1" / "2". */
function chapterOf(lo: string): string | null {
  const m = lo.match(/-(\d+)\./) ?? lo.match(/-(\d+)$/);
  return m ? m[1] : null;
}

export function QuizRunner({ examId }: { examId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [exam, setExam] = useState<ExamDetailDto | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [order, setOrder] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [kFilter, setKFilter] = useState<KFilter>("all");

  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<AttemptResultDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load minimal exam info (no answers) for the intro screen.
  useEffect(() => {
    getExam(examId, false)
      .then((e) => {
        setExam(e);
        setOrder(e.questions.map((q) => q.id));
        setPhase("intro");
      })
      .catch((err: AxiosError) => setPhase(err.response?.status === 403 ? "locked" : "error"));
  }, [examId]);

  const questionsById = useMemo(() => {
    const map = new Map<string, QuestionDto>();
    exam?.questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [exam]);

  // Chapters present in this exam, sorted, with question counts.
  const chapters = useMemo(() => {
    const counts = new Map<string, number>();
    exam?.questions.forEach((q) => {
      const c = chapterOf(q.learningObjective);
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([value, count]) => ({ value, count }));
  }, [exam]);

  const visible = useMemo(
    () =>
      order
        .map((id) => questionsById.get(id))
        .filter((q): q is QuestionDto => !!q)
        .filter((q) => chapterFilter === "all" || chapterOf(q.learningObjective) === chapterFilter)
        .filter((q) => kFilter === "all" || q.kLevel === kFilter),
    [order, questionsById, chapterFilter, kFilter],
  );

  const total = exam?.questions.length ?? 0;
  const answeredCount = visible.filter((q) => (selections[q.id]?.size ?? 0) > 0).length;
  const correctCount = visible.filter((q) => {
    if (!revealed.has(q.id)) return false;
    const correctIds = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));
    return correctIds.size > 0 && setsEqual(selections[q.id] ?? new Set(), correctIds);
  }).length;

  function toggleOption(q: QuestionDto, optionId: string) {
    if (revealed.has(q.id)) return;
    setSelections((prev) => {
      const current = new Set(prev[q.id] ?? []);
      if (q.selectCount === 1) {
        current.clear();
        current.add(optionId);
      } else if (current.has(optionId)) {
        current.delete(optionId);
      } else if (current.size < q.selectCount) {
        current.add(optionId);
      } else {
        toast.info(`You can select up to ${q.selectCount} options.`);
        return prev;
      }
      return { ...prev, [q.id]: current };
    });
  }

  async function start() {
    try {
      // Fetch the answers so each question can give instant feedback, and open an attempt.
      const detail = await getExam(examId, true);
      const attempt = await startAttempt(examId);
      setExam(detail);
      setOrder(detail.questions.map((q) => q.id));
      setAttemptId(attempt.attemptId);
      setPhase("running");
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      if (status === 403) setPhase("locked");
      else toast.error("Could not start practicing.");
    }
  }

  function checkQuestion(qid: string) {
    setRevealed((prev) => new Set(prev).add(qid));
  }

  function reattempt(qid: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.delete(qid);
      return next;
    });
    setSelections((prev) => ({ ...prev, [qid]: new Set() }));
  }

  function shuffle() {
    setOrder((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    toast.success("Order shuffled");
  }

  function reset() {
    setSelections({});
    setRevealed(new Set());
    setChapterFilter("all");
    setKFilter("all");
    setFinished(false);
    setResult(null);
    if (exam) setOrder(exam.questions.map((q) => q.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Reset complete");
  }

  async function finish() {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(selections).map(([questionId, opts]) => ({
        questionId,
        selectedOptionIds: [...opts],
      }));
      const res = await submitAttempt(attemptId, answers);

      // Merge correctness/rationale back into the questions so every card shows its answer.
      const optionMeta = new Map(
        res.questions.flatMap((q) => q.options.map((o) => [o.id, o] as const)),
      );
      setExam((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) => ({
                ...q,
                options: q.options.map((o) => {
                  const m = optionMeta.get(o.id);
                  return m ? { ...o, isCorrect: m.isCorrect, rationale: m.rationale } : o;
                }),
              })),
            }
          : prev,
      );
      setRevealed(new Set(exam?.questions.map((q) => q.id)));
      setResult(res);
      setFinished(true);
      setTimeout(() => document.getElementById("summary")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch {
      toast.error("Could not submit your answers.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Render states ---
  if (phase === "loading") return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (phase === "locked") {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h2 className="font-serif text-2xl font-semibold">This exam is locked</h2>
          <p className="text-muted-foreground">Full access unlocks all exams. Upgrades are coming soon.</p>
          <Button asChild variant="secondary"><Link href="/dashboard">Back to exams</Link></Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "error" || !exam) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h2 className="font-serif text-2xl font-semibold">Something went wrong</h2>
          <Button asChild variant="secondary"><Link href="/dashboard">Back to exams</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const backHref = exam ? `/certifications/${exam.certificationSlug}` : "/dashboard";

  if (phase === "intro") {
    return (
      <div className="animate-fade-up space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" /> Back to {exam.certificationName}
          </Link>
        </Button>
        <Masthead exam={exam} />
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy-soft text-brand-navy">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold">Practice these {total} questions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check each answer as you go and see the rationale immediately. Filter by syllabus
                  section or K-level, shuffle the order, and finish any time to see your score.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={start}>Start practicing</Button>
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Cancel</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // running
  const pct = visible.length ? Math.round((answeredCount / visible.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" /> Back to {exam.certificationName}
        </Link>
      </Button>
      <Masthead exam={exam} />

      {/* Controls */}
      <Card>
        <CardContent className="grid gap-5 pt-6">
          <FilterGroup
            label="Section"
            value={chapterFilter}
            onChange={setChapterFilter}
            options={[
              { value: "all", label: `All ${total}` },
              ...chapters.map((c) => ({ value: c.value, label: `Section ${c.value} · ${c.count}` })),
            ]}
          />
          <FilterGroup
            label="K-Level"
            value={kFilter}
            onChange={(v) => setKFilter(v as KFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "K1", label: "K1" },
              { value: "K2", label: "K2" },
              { value: "K3", label: "K3" },
              { value: "K4", label: "K4" },
            ]}
          />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <div className="flex items-center gap-3.5 text-xs font-semibold text-muted-foreground">
              <span className="whitespace-nowrap">{answeredCount} / {visible.length} answered</span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-red transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">
                {correctCount}
                <span className="mx-1 font-normal text-muted-foreground">/</span>
                {visible.length}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={shuffle}>Shuffle</Button>
              <Button variant="secondary" size="sm" onClick={reset}>Reset</Button>
              <Button size="sm" onClick={finish} disabled={submitting}>
                {submitting ? "Scoring…" : "Finish & score"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center font-serif text-lg italic text-muted-foreground">
            No questions match these filters.
          </CardContent>
        </Card>
      ) : (
        visible.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            displayNumber={i + 1}
            total={visible.length}
            selected={selections[q.id] ?? new Set()}
            onToggle={(optId) => toggleOption(q, optId)}
            revealed={revealed.has(q.id)}
            interactive={!finished}
            onCheck={() => checkQuestion(q.id)}
            onReattempt={() => reattempt(q.id)}
          />
        ))
      )}

      {/* Summary */}
      {finished && result && (
        <section
          id="summary"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy to-brand-navy-deep p-8 text-white shadow-lg md:p-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Practice complete</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold">Results</h2>
          <div className="mt-5 flex items-baseline gap-2 font-serif">
            <span className="text-6xl font-bold">{result.score}</span>
            <span className="text-2xl text-white/50">/ {result.maxScore}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-white/85">
            {result.percentage}% · pass mark {result.passPercentage}% ·{" "}
            {result.passed ? "You passed 🎉" : "Keep practicing"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={reset}>Try again</Button>
            <Button asChild variant="secondary"><Link href="/dashboard">Back to exams</Link></Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Masthead({ exam }: { exam: ExamDetailDto }) {
  // Emphasize the last word of the title (e.g. "Sample Exam A" -> A in red).
  const words = exam.title.split(" ");
  const last = words.pop();
  return (
    <header className="relative overflow-hidden rounded-3xl bg-card p-8 shadow-[0_2px_8px_rgba(27,61,122,0.06)] md:p-9">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-red via-brand-red to-brand-navy" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-navy-soft px-3 py-1.5 text-brand-navy">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
          {exam.certificationName}
        </span>
      </div>
      <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
        {words.join(" ")} <em className="not-italic text-brand-red">{last}</em>
      </h1>
      {exam.description && (
        <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-muted-foreground">
          {exam.description}
        </p>
      )}
    </header>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-all",
              value === o.value
                ? "border-brand-navy bg-brand-navy text-white shadow-[0_2px_6px_rgba(27,61,122,0.18)]"
                : "border-border bg-background text-muted-foreground hover:border-brand-navy-border hover:bg-brand-navy-soft hover:text-brand-navy",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
