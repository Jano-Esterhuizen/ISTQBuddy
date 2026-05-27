"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { QuestionDto } from "@/types";

interface QuestionCardProps {
  question: QuestionDto;
  index: number;
  total: number;
  selected: Set<string>;
  onToggle: (optionId: string) => void;
}

export function QuestionCard({ question, index, total, selected, onToggle }: QuestionCardProps) {
  const isMulti = question.selectCount > 1;
  const kVariant = question.kLevel === "K1" ? "k1" : question.kLevel === "K2" ? "k2" : "k3";

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_rgba(27,61,122,0.06)] md:p-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="font-serif text-2xl font-bold text-brand-navy">
          <span className="mr-1 align-top text-xs font-medium italic text-muted-foreground">Q</span>
          {index + 1}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ {total}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={kVariant}>{question.kLevel}</Badge>
          <Badge>{question.learningObjective}</Badge>
        </div>
      </header>

      <p className="mb-3 whitespace-pre-wrap font-serif text-lg leading-relaxed">{question.stem}</p>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-navy">
        {isMulti ? `Select ${question.selectCount} options` : "Select one option"}
      </p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isSelected = selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={cn(
                "flex items-start gap-3.5 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all",
                isSelected
                  ? "border-brand-navy bg-brand-navy-soft shadow-[0_0_0_3px_rgba(27,61,122,0.12)]"
                  : "border-border bg-background hover:translate-x-0.5 hover:border-brand-navy-border hover:bg-brand-navy-soft/50",
              )}
            >
              <span
                className={cn(
                  "font-serif text-lg font-bold leading-tight",
                  isSelected ? "text-brand-navy" : "text-brand-red",
                )}
              >
                {opt.label})
              </span>
              <span className="flex-1 text-sm leading-relaxed">{opt.text}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
