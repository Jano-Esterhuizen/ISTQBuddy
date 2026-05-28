import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal/portal-header";
import { ProfileBootstrap } from "@/components/portal/profile-bootstrap";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces guard (middleware also protects these routes).
  if (!user) redirect("/login");

  return (
    <div className="bg-ornament flex min-h-screen flex-col">
      <ProfileBootstrap />
      <PortalHeader email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
