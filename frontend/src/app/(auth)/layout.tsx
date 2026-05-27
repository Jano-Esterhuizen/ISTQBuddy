import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ornament flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 font-serif text-2xl font-semibold tracking-tight">
        ISTQ<span className="text-brand-red">buddy</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
