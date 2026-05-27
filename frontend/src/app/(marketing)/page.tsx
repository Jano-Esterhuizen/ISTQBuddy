import Link from "next/link";
import { CheckCircle2, BookOpenCheck, BarChart3, Sparkles } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpenCheck,
    title: "Realistic questions",
    body: "66 CTFL v4.0 questions across all chapters, tagged with K-levels and learning objectives.",
  },
  {
    icon: CheckCircle2,
    title: "Instant rationales",
    body: "Every option explained — understand why answers are right or wrong, not just the score.",
  },
  {
    icon: BarChart3,
    title: "Track your readiness",
    body: "See your score against the 65% pass mark and revisit weak areas before exam day.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="h-full">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy-soft text-brand-navy">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="flex h-full flex-col pt-6">
              <h3 className="font-serif text-2xl font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get a feel for the real thing.</p>
              <p className="my-6 font-serif text-4xl font-bold">R0</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" /> Sample Exam A</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" /> Instant feedback & rationales</li>
              </ul>
              <Button asChild variant="secondary" className="mt-8 w-full">
                <Link href="/signup">Start free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-brand-navy/30 ring-1 ring-brand-navy/20">
            <CardContent className="flex h-full flex-col pt-6">
              <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-brand-red-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-red">
                <Sparkles className="h-3 w-3" /> Full access
              </span>
              <h3 className="font-serif text-2xl font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">Everything you need to pass.</p>
              <p className="my-6 font-serif text-4xl font-bold">Coming soon</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" /> All exams & question banks</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" /> Full progress tracking</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green" /> Secure checkout via Lemon Squeezy</li>
              </ul>
              <Button className="mt-8 w-full" disabled>
                Upgrade (available soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
