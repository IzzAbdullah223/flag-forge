import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { Flag, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Flag size={18} className="text-[var(--signal-green)]" />
          <span className="font-medium">Flag Forge</span>
        </Link>

        <LogoutLink className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <LogOut size={16} />
          Sign out
        </LogoutLink>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}