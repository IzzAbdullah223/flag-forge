import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono-key text-sm text-[var(--text-muted)] tracking-widest uppercase mb-4">
        Feature Flag Platform
      </p>
      <h1 className="text-5xl font-semibold mb-4">Flag Forge</h1>
      <p className="text-[var(--text-muted)] max-w-md mb-10">
        Roll out features gradually, target the right users, and kill switches
        instantly — without a redeploy.
      </p>
      <div className="flex gap-4">
        <LoginLink className="px-5 py-2.5 rounded-md bg-[var(--signal-green)] text-black font-medium">
          Sign in
        </LoginLink>
        <RegisterLink className="px-5 py-2.5 rounded-md border border-[var(--border)] text-[var(--text)]">
          Sign up
        </RegisterLink>
      </div>
    </main>
  );
}