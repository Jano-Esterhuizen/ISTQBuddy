export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
      <span className="whitespace-nowrap">
        {value} / {total} answered
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-red transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
