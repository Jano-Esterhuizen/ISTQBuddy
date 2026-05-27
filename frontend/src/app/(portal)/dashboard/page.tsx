import { ExamList } from "@/components/quiz/exam-list";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Your exams</h1>
        <p className="mt-1 text-muted-foreground">
          Pick an exam to practice. The free sample is open to everyone.
        </p>
      </div>
      <ExamList />
    </div>
  );
}
