"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  Library,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { AxiosError } from "axios";
import { getCertification } from "@/lib/api";
import type { CertificationDetailDto, ExamSummaryDto } from "@/types";
import { getSyllabus, type Syllabus, type SyllabusSection } from "@/lib/mock-syllabus";
import { getExamInfo, type ExamInfo } from "@/lib/exam-info";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type WorkspaceTab = "practice" | "study" | "learn" | "cheat";

const TABS: { id: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
  { id: "practice", label: "Practice Questions", icon: ClipboardList },
  { id: "study", label: "Study Guide", icon: GraduationCap },
  { id: "learn", label: "Learning Material", icon: Library },
  { id: "cheat", label: "Cheat Sheet", icon: FileText },
];

const TABS_WITH_SIDEBAR: WorkspaceTab[] = ["learn", "cheat"];

export function CertificationExams({ slug }: { slug: string }) {
  const [cert, setCert] = useState<CertificationDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkspaceTab>("study");

  const syllabus = useMemo(() => getSyllabus(slug), [slug]);
  const examInfo = useMemo(() => getExamInfo(slug), [slug]);
  const allSections = useMemo(
    () => syllabus.chapters.flatMap((c) => c.sections),
    [syllabus],
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(allSections[0]?.id ?? "");
  const activeSection =
    allSections.find((s) => s.id === activeSectionId) ?? allSections[0];

  const showSidebar = TABS_WITH_SIDEBAR.includes(tab);

  useEffect(() => {
    getCertification(slug)
      .then(setCert)
      .catch((err: AxiosError) =>
        setError(
          err.response?.status === 404
            ? "Certification not found."
            : "Could not load this certification.",
        ),
      );
  }, [slug]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back to catalog</Link>
        </Button>
      </div>
    );
  }
  if (!cert) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Catalog
        </Link>
      </Button>

      <div
        className={cn(
          "grid gap-6",
          showSidebar && "lg:grid-cols-[300px_minmax(0,1fr)]",
        )}
      >
        {showSidebar && (
          <ChapterSidebar
            name={cert.name}
            version={syllabus.version}
            syllabus={syllabus}
            activeSectionId={activeSection?.id ?? ""}
            onSelect={setActiveSectionId}
          />
        )}

        <div className="min-w-0 space-y-4">
          <WorkspaceHeader
            certName={cert.name}
            isOwned={cert.isOwned}
            activeTab={tab}
            onTabChange={setTab}
          />

          {tab === "practice" && <PracticeView exams={cert.exams} />}
          {tab === "study" && <StudyGuideView examInfo={examInfo} certName={cert.name} />}
          {tab === "learn" && activeSection && (
            <LearningMaterialView section={activeSection} />
          )}
          {tab === "cheat" && activeSection && <CheatView section={activeSection} />}
        </div>
      </div>
    </div>
  );
}

function ChapterSidebar({
  name,
  version,
  syllabus,
  activeSectionId,
  onSelect,
}: {
  name: string;
  version: string;
  syllabus: Syllabus;
  activeSectionId: string;
  onSelect: (id: string) => void;
}) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(syllabus.chapters.map((c) => [c.id, true])),
  );

  return (
    <aside className="h-fit min-w-0 lg:sticky lg:top-4">
      <Card className="overflow-hidden">
        <div className="flex items-start gap-3 border-b border-border/60 p-5">
          <div className="shrink-0 rounded-md bg-brand-navy-soft p-2 text-brand-navy">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-base font-semibold leading-tight">{name}</h2>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-brand-red">
              {version}
            </p>
          </div>
        </div>

        <nav className="space-y-1 p-2">
          {syllabus.chapters.map((chapter) => {
            const isOpen = openChapters[chapter.id];
            return (
              <div key={chapter.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    setOpenChapters((prev) => ({
                      ...prev,
                      [chapter.id]: !prev[chapter.id],
                    }))
                  }
                  className="flex w-full items-start gap-2 rounded-md p-2 text-left text-sm font-semibold transition hover:bg-brand-navy-soft"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[11px] font-bold text-white">
                    {chapter.number}
                  </span>
                  <span className="min-w-0 flex-1 break-words leading-snug">
                    {chapter.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen ? "" : "-rotate-90",
                    )}
                  />
                </button>
                {isOpen && (
                  <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border/60 pl-1">
                    {chapter.sections.map((section) => {
                      const active = section.id === activeSectionId;
                      return (
                        <li key={section.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelect(section.id)}
                            className={cn(
                              "block w-full rounded-md px-3 py-1.5 text-left text-[13px] leading-snug transition",
                              active
                                ? "border-l-2 border-brand-red bg-brand-navy-soft font-semibold text-brand-navy"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            <span className="block break-words">
                              <span className="font-semibold">{section.number}</span>{" "}
                              {section.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </Card>
    </aside>
  );
}

function WorkspaceHeader({
  certName,
  isOwned,
  activeTab,
  onTabChange,
}: {
  certName: string;
  isOwned: boolean;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
}) {
  return (
    <Card className="border-l-4 border-l-brand-red p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-md bg-brand-red-soft p-2 text-brand-red">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
              Free Exam Prep
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-lg font-semibold leading-tight">
                {certName}
              </h1>
              {isOwned && (
                <Badge variant="green">
                  <CheckCircle2 className="h-3 w-3" /> Owned
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border-[1.5px] px-3.5 py-2 text-sm font-semibold transition",
                  active
                    ? "border-brand-navy bg-brand-navy text-white shadow-[0_2px_6px_rgba(27,61,122,0.20)]"
                    : "border-border bg-background text-muted-foreground hover:border-brand-navy-border hover:bg-brand-navy-soft hover:text-brand-navy",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function PracticeView({ exams }: { exams: ExamSummaryDto[] }) {
  return (
    <div className="space-y-4">
      {exams.length === 0 ? (
        <Card className="py-14 text-center font-serif text-lg italic text-muted-foreground">
          No exams yet — check back soon.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="mb-3 flex items-center gap-2">
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
                  {exam.questionCount} questions · {exam.totalPoints} points · pass{" "}
                  {exam.passPercentage}%
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
      )}
    </div>
  );
}

function StudyGuideView({
  examInfo,
  certName,
}: {
  examInfo: ExamInfo | null;
  certName: string;
}) {
  if (!examInfo) {
    return (
      <Card className="p-8">
        <h2 className="font-serif text-2xl font-semibold">Study Guide</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Detailed exam composition and study strategy for <strong>{certName}</strong> are
          on the way. In the meantime, head to the Learning Material tab to start working
          through the syllabus content.
        </p>
      </Card>
    );
  }

  const totalKLevelQuestions =
    (examInfo.kLevels.k1?.count ?? 0) +
    (examInfo.kLevels.k2?.count ?? 0) +
    (examInfo.kLevels.k3?.count ?? 0) +
    (examInfo.kLevels.k4?.count ?? 0);

  return (
    <div className="space-y-4">
      {/* Intro */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-red">
          <GraduationCap className="h-4 w-4" /> Your game plan
        </div>
        <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          {examInfo.acronym} <span className="text-muted-foreground">·</span>{" "}
          <span className="text-xl text-muted-foreground">{examInfo.version}</span>
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-foreground/90">{examInfo.intro}</p>
      </Card>

      {/* Exam at a glance */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold">Exam at a glance</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox label="Questions" value={String(examInfo.totalQuestions)} />
          <StatBox
            label="Time"
            value={`${examInfo.examMinutes} min`}
            sub={`${examInfo.examMinutesExtended} min with +25%`}
          />
          <StatBox
            label="Pass mark"
            value={`${examInfo.passingPercentage}%`}
            sub={`${examInfo.passingPoints} of ${examInfo.totalPoints} points`}
          />
          <StatBox
            label="Format"
            value="Multiple choice"
            sub="Closed book"
          />
        </div>

        {totalKLevelQuestions > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              K-level breakdown
            </h4>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-foreground text-background">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">K-level</th>
                    <th className="px-4 py-3 text-left font-semibold">Meaning</th>
                    <th className="px-4 py-3 text-right font-semibold">Questions</th>
                    <th className="px-4 py-3 text-right font-semibold">Time / Q</th>
                  </tr>
                </thead>
                <tbody>
                  {examInfo.kLevels.k1 && (
                    <KRow level="K1" meaning="Remember" entry={examInfo.kLevels.k1} />
                  )}
                  {examInfo.kLevels.k2 && (
                    <KRow level="K2" meaning="Understand" entry={examInfo.kLevels.k2} />
                  )}
                  {examInfo.kLevels.k3 && (
                    <KRow level="K3" meaning="Apply" entry={examInfo.kLevels.k3} />
                  )}
                  {examInfo.kLevels.k4 && (
                    <KRow level="K4" meaning="Analyse" entry={examInfo.kLevels.k4} />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Where the questions come from */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold">Where the questions come from</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Question count per chapter, with K-level distribution. Highlighted rows are the
          chapters that carry the most weight — start your study time here.
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Chapter</th>
                <th className="px-4 py-3 text-right font-semibold">Q</th>
                <th className="px-4 py-3 text-right font-semibold">Pts</th>
                <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
                  K1
                </th>
                <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
                  K2
                </th>
                <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
                  K3
                </th>
                <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
                  K4
                </th>
              </tr>
            </thead>
            <tbody>
              {examInfo.chapters.map((ch) => (
                <tr
                  key={ch.number}
                  className={cn(
                    "border-t border-border align-top",
                    ch.focus && "bg-brand-red-soft/40",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {ch.focus && (
                        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {ch.number}. {ch.title}
                        </div>
                        {ch.note && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {ch.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {ch.questionCount}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {ch.pointCount}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                    {ch.k1 ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                    {ch.k2 ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                    {ch.k3 ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                    {ch.k4 ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-brand-red-border bg-brand-red-soft p-4 text-sm text-foreground/90">
          <p className="font-semibold text-brand-red">Where to focus</p>
          <p className="mt-1">{examInfo.focusHeadline}</p>
        </div>
      </Card>

      {/* Strategy tips */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold">How to approach the exam</h3>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
          {examInfo.strategyTips.map((tip, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-navy" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Admin */}
      <Card className="p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold">Administrative info</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <AdminBlock label="Registration" body={examInfo.administrative.registration} />
          <AdminBlock label="Format" body={examInfo.administrative.format} />
          <AdminBlock label="Retakes" body={examInfo.administrative.retakes} />
          <AdminBlock label="Recommended prep" body={examInfo.administrative.prep} />
        </div>
      </Card>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-secondary/40 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl font-semibold leading-tight text-brand-navy">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function KRow({
  level,
  meaning,
  entry,
}: {
  level: string;
  meaning: string;
  entry: { count: number; minutesPerQ: number };
}) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2.5 font-semibold">{level}</td>
      <td className="px-4 py-2.5 text-muted-foreground">{meaning}</td>
      <td className="px-4 py-2.5 text-right">{entry.count}</td>
      <td className="px-4 py-2.5 text-right text-muted-foreground">
        {entry.minutesPerQ} min
      </td>
    </tr>
  );
}

function AdminBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-red">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground/90">{body}</p>
    </div>
  );
}

function LearningMaterialView({ section }: { section: SyllabusSection }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        {section.number} {section.title}
      </h2>

      <div className="mt-5 rounded-xl border border-brand-navy-border bg-brand-navy-soft/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <Sparkles className="h-4 w-4" /> Key Takeaways
          </div>
          <Button size="sm" className="bg-brand-red hover:bg-brand-red-deep">
            <Sparkles className="h-4 w-4" /> Explain This Topic
          </Button>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
          {section.keyTakeaways.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" /> Last updated: {section.lastUpdated}
      </p>

      <div className="mt-6 space-y-5">
        {section.studyGuide.map((block, i) => (
          <div key={i}>
            <h3 className="font-serif text-xl font-semibold">{block.heading}</h3>
            <p className="mt-2 text-[15px] leading-7 text-foreground/90">{block.body}</p>
          </div>
        ))}

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Term</th>
                <th className="px-4 py-3 text-left font-semibold">Exam meaning</th>
              </tr>
            </thead>
            <tbody>
              {section.cheatSheet.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.term}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function CheatView({ section }: { section: SyllabusSection }) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-red">
        <FileText className="h-4 w-4" /> Cheat Sheet
      </div>
      <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
        {section.number} {section.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Quick reference for this section. Mock content — replace with the real cheat
        sheet later.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {section.cheatSheet.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/70 bg-secondary/40 p-4"
          >
            <p className="font-serif text-base font-semibold text-brand-navy">
              {row.term}
            </p>
            <p className="mt-1 text-sm text-foreground/80">{row.meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-brand-navy-border bg-brand-navy-soft p-4 text-sm text-brand-navy-deep">
        <p className="font-semibold">Exam tip</p>
        <p className="mt-1 text-foreground/80">
          Mock placeholder for a quick exam-day reminder tied to this section. Replace
          with real guidance later.
        </p>
      </div>
    </Card>
  );
}
