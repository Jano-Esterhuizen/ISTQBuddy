"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuestionDto } from "@/types";

interface QuestionCardProps {
  question: QuestionDto;
  displayNumber: number;
  total: number;
  selected: Set<string>;
  onToggle: (optionId: string) => void;
  revealed: boolean;
  /** Study mode (pre-finish): shows per-question Check / Reattempt buttons. */
  interactive: boolean;
  onCheck: () => void;
  onReattempt: () => void;
}

function setsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

export function QuestionCard({
  question,
  displayNumber,
  total,
  selected,
  onToggle,
  revealed,
  interactive,
  onCheck,
  onReattempt,
}: QuestionCardProps) {
  const isMulti = question.selectCount > 1;
  const kVariant = question.kLevel === "K1" ? "k1" : question.kLevel === "K2" ? "k2" : "k3";

  const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id));
  const isCorrect = revealed && correctIds.size > 0 && setsEqual(selected, correctIds);
  const canCheck = selected.size === question.selectCount;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-[0_2px_8px_rgba(27,61,122,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(27,61,122,0.08)] md:p-8",
        revealed ? "border-border" : "border-transparent",
      )}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="font-serif text-3xl font-bold leading-none text-brand-navy">
          <span className="mr-1 align-top text-xs font-medium italic text-muted-foreground">Q</span>
          {question.externalId}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="navy">{question.section === "main" ? "Main" : "Additional"} · {displayNumber} of {total}</Badge>
          <Badge variant={kVariant}>{question.kLevel}</Badge>
          <Badge>{question.learningObjective}</Badge>
          <Badge>{question.points} pt</Badge>
        </div>
      </header>

      <p className="mb-5 whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground">
        {question.stem}
      </p>
      <p className="mb-3.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-navy">
        {isMulti ? `Select ${question.selectCount} options` : "Select one option"}
      </p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isSel = selected.has(opt.id);
          const showCorrect = revealed && opt.isCorrect;
          const showWrong = revealed && !opt.isCorrect && isSel;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={revealed}
              onClick={() => onToggle(opt.id)}
              className={cn(
                "flex items-start gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all",
                showCorrect
                  ? "border-brand-green/40 bg-brand-green-soft"
                  : showWrong
                    ? "border-brand-red-border bg-brand-red-soft"
                    : isSel
                      ? "border-brand-navy bg-brand-navy-soft shadow-[0_0_0_3px_rgba(27,61,122,0.12)]"
                      : "border-border bg-background",
                !revealed && !isSel && "hover:translate-x-0.5 hover:border-brand-navy-border hover:bg-brand-navy-soft/50",
                revealed && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "font-serif text-lg font-bold leading-tight",
                  showCorrect ? "text-brand-green" : showWrong ? "text-brand-red" : isSel ? "text-brand-navy" : "text-brand-red",
                )}
              >
                {opt.label})
              </span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm leading-relaxed text-foreground">{opt.text}</span>
                {revealed && opt.rationale && (
                  <span
                    className={cn(
                      "text-[13px] leading-relaxed",
                      showCorrect ? "text-brand-green" : showWrong ? "text-brand-red" : "text-muted-foreground",
                    )}
                  >
                    {opt.rationale}
                  </span>
                )}
              </span>
              {showCorrect && (
                <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase text-brand-green">
                  <Check className="h-3.5 w-3.5" />
                  {isSel ? "Correct" : "Answer"}
                </span>
              )}
              {showWrong && (
                <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase text-brand-red">
                  <X className="h-3.5 w-3.5" /> Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Per-question actions (study mode, pre-finish) */}
      {interactive && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              "text-xs font-semibold",
              revealed
                ? isCorrect
                  ? "text-brand-green"
                  : "text-brand-red"
                : "font-medium text-muted-foreground",
            )}
          >
            {revealed
              ? isCorrect
                ? "Answered correctly"
                : "Not quite — see the highlighted answer"
              : isMulti
                ? `${selected.size} of ${question.selectCount} selected`
                : selected.size
                  ? "Ready to check"
                  : "Tap an option to select"}
          </span>
          {revealed ? (
            <Button variant="secondary" size="sm" onClick={onReattempt}>
              Reattempt
            </Button>
          ) : (
            <Button size="sm" onClick={onCheck} disabled={!canCheck}>
              Check answer
            </Button>
          )}
        </div>
      )}

    </article>
  );
}
