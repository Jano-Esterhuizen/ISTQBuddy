import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-ornament flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
            ISTQ<span className="text-brand-red">buddy</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/#features">Features</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/#pricing">Pricing</Link>
            </Button>
            {user ? (
              <Button asChild variant="primary" size="sm">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          ISTQBuddy · Practice tool · Not affiliated with ISTQB. Based on the CTFL v4.0 syllabus.
        </div>
      </footer>
    </div>
  );
}
