import { CertificationCatalog } from "@/components/catalog/certification-catalog";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Certifications</h1>
        <p className="mt-1 text-muted-foreground">
          Browse the catalog and pick a certification to practice. The free sample is open to everyone.
        </p>
      </div>
      <CertificationCatalog />
    </div>
  );
}
