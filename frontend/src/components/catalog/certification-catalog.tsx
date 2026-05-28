"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, ShoppingCart } from "lucide-react";
import { getCertifications } from "@/lib/api";
import type { CatalogCertificationDto, CertificationCategory } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const CATEGORY_ORDER: CertificationCategory[] = ["Core", "Specialist", "Expert", "Other"];
const CATEGORY_LABEL: Record<CertificationCategory, string> = {
  Core: "ISTQB Core",
  Specialist: "ISTQB Specialist",
  Expert: "ISTQB Expert Levels",
  Other: "Other",
};

type Filter = "all" | CertificationCategory;

export function CertificationCatalog() {
  const [certs, setCerts] = useState<CatalogCertificationDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    getCertifications()
      .then(setCerts)
      .catch(() => setError("Could not load certifications. Is the API running?"));
  }, []);

  const filtered = useMemo(() => {
    if (!certs) return [];
    const q = query.trim().toLowerCase();
    return certs
      .filter((c) => filter === "all" || c.category === filter)
      .filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [certs, query, filter]);

  const grouped = useMemo(() => {
    const map = new Map<CertificationCategory, CatalogCertificationDto[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!certs) return <p className="text-sm text-muted-foreground">Loading certifications…</p>;

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a certification…"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...CATEGORY_ORDER] as Filter[]).map((f) => {
            const count = f === "all" ? certs.length : certs.filter((c) => c.category === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                  filter === f
                    ? "border-brand-navy bg-brand-navy text-white shadow-[0_2px_6px_rgba(27,61,122,0.18)]"
                    : "border-border bg-background text-muted-foreground hover:border-brand-navy-border hover:bg-brand-navy-soft hover:text-brand-navy",
                )}
              >
                {f === "all" ? "All" : CATEGORY_LABEL[f].replace("ISTQB ", "")} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-16 text-center font-serif text-lg italic text-muted-foreground">
          No certifications match your search.
        </Card>
      ) : (
        [...grouped.entries()].map(([cat, items]) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <CertCard key={c.id} cert={c} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function CertCard({ cert }: { cert: CatalogCertificationDto }) {
  const comingSoon = cert.examCount === 0;
  const showBuyNow = !comingSoon && !cert.isOwned && !cert.hasFreeSample && cert.isLocked;

  const staticBadge = comingSoon ? (
    <Badge>Coming soon</Badge>
  ) : cert.isOwned ? (
    <Badge variant="green">
      <CheckCircle2 className="h-3 w-3" /> Owned
    </Badge>
  ) : cert.hasFreeSample ? (
    <Badge variant="green">Free sample</Badge>
  ) : (
    <Badge variant="green">Available</Badge>
  );

  const inner = (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-3 overflow-hidden p-5 transition-all",
        comingSoon
          ? "opacity-60"
          : "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,61,122,0.10)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {showBuyNow ? <span className="h-[26px]" /> : staticBadge}
        {!comingSoon && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
      </div>
      <h3 className="font-serif text-base font-semibold leading-snug">{cert.name}</h3>
      <p className="mt-auto text-xs text-muted-foreground">
        {comingSoon
          ? "Content in progress"
          : `${cert.examCount} exam${cert.examCount === 1 ? "" : "s"}`}
      </p>

      {showBuyNow && (
        // The pill animates from its top-left "anchor" position to the centre of
        // the card on group-hover. Absolute positioning lets us translate freely
        // without affecting layout flow.
        <div
          className={cn(
            "pointer-events-none absolute left-5 top-5 z-10 origin-top-left transform",
            "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:left-1/2 group-hover:top-1/2",
            "group-hover:-translate-x-1/2 group-hover:-translate-y-1/2",
            "group-hover:scale-[1.8]",
          )}
        >
          <Badge
            variant="red"
            className="shadow-[0_2px_8px_rgba(200,32,47,0.18)] transition-shadow duration-500 group-hover:shadow-[0_8px_24px_rgba(200,32,47,0.35)]"
          >
            <ShoppingCart className="h-3 w-3" /> Buy now
          </Badge>
        </div>
      )}
    </Card>
  );

  if (comingSoon) return inner;
  return (
    <Link href={`/certifications/${cert.slug}`} className="group block">
      {inner}
    </Link>
  );
}
