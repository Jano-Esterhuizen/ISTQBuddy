"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Mermaid } from "./mermaid";

/**
 * Renders a question's optional `diagram` Markdown beneath the stem.
 * Supports GFM tables (decision tables, traceability/data matrices) and
 * ```mermaid``` fenced blocks (state diagrams, activity/flowcharts).
 */
export function QuestionDiagram({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-secondary/30 p-4 sm:p-5",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Unwrap <pre> so mermaid SVGs/tables are not boxed in code styling.
          pre: ({ children }) => <>{children}</>,
          code: ({ className: cls, children, ...props }) => {
            if (/language-mermaid/.test(cls || "")) {
              return <Mermaid chart={String(children)} />;
            }
            return (
              <code
                className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px] text-brand-navy"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: (props) => (
            <div className="overflow-x-auto">
              <table
                className="my-1 w-full border-collapse text-[13px] leading-relaxed"
                {...props}
              />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-brand-navy text-left text-white" {...props} />
          ),
          th: (props) => (
            <th
              className="border border-brand-navy-border px-2.5 py-2 font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-border px-2.5 py-1.5 align-top"
              {...props}
            />
          ),
          p: (props) => (
            <p
              className="mb-2 text-sm leading-relaxed text-foreground last:mb-0"
              {...props}
            />
          ),
          ul: (props) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 text-sm last:mb-0" {...props} />
          ),
          ol: (props) => (
            <ol
              className="mb-2 list-decimal space-y-1 pl-5 text-sm last:mb-0"
              {...props}
            />
          ),
          li: (props) => <li className="leading-relaxed" {...props} />,
          strong: (props) => (
            <strong className="font-semibold text-brand-navy" {...props} />
          ),
          h3: (props) => (
            <h3
              className="mb-1 mt-2 text-xs font-bold uppercase tracking-wider text-brand-navy first:mt-0"
              {...props}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
