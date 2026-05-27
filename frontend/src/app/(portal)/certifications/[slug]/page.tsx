import { CertificationExams } from "@/components/catalog/certification-exams";

export default async function CertificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CertificationExams slug={slug} />;
}
