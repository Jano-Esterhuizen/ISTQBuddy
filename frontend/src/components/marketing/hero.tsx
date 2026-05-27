"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-navy"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            Certified Tester Foundation Level v4.0
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          >
            Pass your ISTQB exam with <em className="text-brand-red not-italic">confidence</em>.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-muted-foreground"
          >
            Realistic practice questions with instant feedback, full rationales, and per-question
            learning objectives — built directly on the latest syllabus.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Start the free sample exam</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/#pricing">See pricing</Link>
            </Button>
          </motion.div>

          <motion.p variants={item} className="mt-4 text-xs text-muted-foreground">
            No credit card required for the free sample.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
