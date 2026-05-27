"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { AxiosError } from "axios";
import { getCertification } from "@/lib/api";
import type { CertificationDetailDto } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CertificationExams({ slug }: { slug: string }) {
  const [cert, setCert] = useState<CertificationDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCertification(slug)
      .then(setCert)
      .catch((err: AxiosError) =>
        setError(err.response?.status === 404 ? "Certification not found." : "Could not load this certification."),
      );
  }, [slug]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="secondary"><Link href="/dashboard">Back to catalog</Link></Button>
      </div>
    );
  }
  if (!cert) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Catalog</Link>
        </Button>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{cert.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {cert.exams.length === 0
            ? "Exams for this certification are coming soon."
            : `${cert.exams.length} exam${cert.exams.length === 1 ? "" : "s"} available.`}
        </p>
      </div>

      {cert.exams.length === 0 ? (
        <Card className="py-14 text-center font-serif text-lg italic text-muted-foreground">
          No exams yet — check back soon.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cert.exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="mb-3 flex items-center gap-2">
                  {exam.isFreeSample ? (
                    <Badge variant="green">Free</Badge>
                  ) : exam.isLocked ? (
                    <Badge variant="red"><Lock className="h-3 w-3" /> Locked</Badge>
                  ) : (
                    <Badge variant="green">Unlocked</Badge>
                  )}
                </div>
                <h3 className="font-serif text-xl font-semibold">{exam.title}</h3>
                {exam.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{exam.description}</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {exam.questionCount} questions · {exam.totalPoints} points · pass {exam.passPercentage}%
                </p>
                <div className="mt-auto pt-6">
                  {exam.isLocked ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <Lock className="h-4 w-4" /> Requires full access
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/exams/${exam.id}`}>Start exam <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
