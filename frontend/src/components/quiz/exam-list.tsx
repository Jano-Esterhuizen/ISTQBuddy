"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { getExams } from "@/lib/api";
import type { ExamSummaryDto } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ExamList() {
  const [exams, setExams] = useState<ExamSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExams()
      .then(setExams)
      .catch(() => setError("Could not load exams. Is the API running?"));
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!exams) {
    return <p className="text-sm text-muted-foreground">Loading exams…</p>;
  }

  if (exams.length === 0) {
    return <p className="text-sm text-muted-foreground">No exams available yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {exams.map((exam) => (
        <Card key={exam.id} className="flex flex-col">
          <CardContent className="flex flex-1 flex-col pt-6">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="navy">{exam.certificationName}</Badge>
              {exam.isFreeSample ? (
                <Badge variant="green">Free</Badge>
              ) : exam.isLocked ? (
                <Badge variant="red">
                  <Lock className="h-3 w-3" /> Locked
                </Badge>
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
                  <Link href={`/exams/${exam.id}`}>
                    Start exam <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
