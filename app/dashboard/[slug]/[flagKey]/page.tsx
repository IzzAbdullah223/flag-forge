import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { getOrCreateFlagState, updateFlagState } from "@/actions/flagStates";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import RulesEditor from "@/components/RulesEditor";
import FlagStateControls from "@/components/FlagStateControls";
import { RuleGroup } from "@/lib/evaluation/rules";

export const dynamic = "force-dynamic";

type FlagPageProps = {
  params: Promise<{ slug: string; flagKey: string }>;
};

export default async function FlagPage({ params }: FlagPageProps) {
  const { slug, flagKey } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { environments: true },
  });

  if (!project) notFound();

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
  });

  if (!membership) notFound();

  const flag = await prisma.flag.findUnique({
    where: { projectId_key: { projectId: project.id, key: flagKey } },
  });

  if (!flag) notFound();

  const flagStates = await Promise.all(
    project.environments.map((env) => getOrCreateFlagState(flag!.id, env.id))
  );

  async function updateFlagStateFromForm(formData: FormData) {
    "use server";
    const environmentId = String(formData.get("environmentId") ?? "");
    const enabled = formData.get("enabled") === "on";
    const rolloutPercent = Number(formData.get("rolloutPercent") ?? 0);

    await updateFlagState(flag!.id, environmentId, { enabled, rolloutPercent });
    revalidatePath(`/dashboard/${slug}/${flagKey}`);
  }

  return (
    <div>
      <div className="mb-10">
        <p className="font-mono-key text-xs text-[var(--text-muted)] mb-1">{project.name}</p>
        <h1 className="font-mono-key text-2xl font-semibold">{flag.key}</h1>
        {flag.description && (
          <p className="text-[var(--text-muted)] text-sm mt-1">{flag.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {project.environments.map((env, i) => {
          const state = flagStates[i];
          const rules = Array.isArray(state.rules) ? null : (state.rules as RuleGroup | null);

          return (
            <div
              key={env.id}
              className="border border-[var(--border)] bg-[var(--panel)] rounded-xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[var(--border)]">
                <p className="font-medium">{env.name}</p>
                <p className="font-mono-key text-xs text-[var(--text-muted)]">{env.key}</p>
              </div>

              <form action={updateFlagStateFromForm} className="px-6 py-6 border-b border-[var(--border)]">
                <div className="flex items-end justify-between gap-8">
                  <FlagStateControls
                    environmentId={env.id}
                    initialEnabled={state.enabled}
                    initialRolloutPercent={state.rolloutPercent}
                  />
                  <button
                    type="submit"
                    className="text-sm px-5 py-2 rounded-md bg-[var(--signal-green)] text-black font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              </form>

              <div className="px-6 py-6">
                <RulesEditor flagId={flag.id} environmentId={env.id} initialRules={rules} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}