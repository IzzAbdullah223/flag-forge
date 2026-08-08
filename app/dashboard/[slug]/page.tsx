import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { createEnvironment } from "@/actions/environments";
import { createFlag } from "@/actions/flags";
import { createApiKey } from "@/actions/apiKeys";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Server, KeyRound, Flag as FlagIcon, Plus, ArrowRight } from "lucide-react";
import ApiKeyDisplay from "@/components/ApiKeyDisplay";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      environments: { include: { apiKeys: true } },
      flags: true,
    },
  });

  if (!project) notFound();

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
  });

  if (!membership) notFound();

  async function createEnvironmentFromForm(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const key = String(formData.get("key") ?? "").trim();
    if (!name || !key) return;
    await createEnvironment(project!.id, name, key);
    revalidatePath(`/dashboard/${slug}`);
  }

  async function createFlagFromForm(formData: FormData) {
    "use server";
    const key = String(formData.get("key") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!key) return;
    await createFlag(project!.id, key, description || undefined);
    revalidatePath(`/dashboard/${slug}`);
  }

  async function createApiKeyFromForm(formData: FormData) {
    "use server";
    const environmentId = String(formData.get("environmentId") ?? "");
    const label = String(formData.get("label") ?? "").trim();
    const type = String(formData.get("type") ?? "SERVER") as "SERVER" | "CLIENT";
    if (!environmentId || !label) return;
    await createApiKey(environmentId, label, type);
    revalidatePath(`/dashboard/${slug}`);
  }

  return (
    <div>
      <div className="mb-10">
        <p className="font-mono-key text-xs text-[var(--text-muted)] mb-1">{project.slug}</p>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </div>

      {/* Environments */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} className="text-[var(--text-muted)]" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Environments
          </h2>
        </div>

        {project.environments.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm mb-4">No environments yet.</p>
        ) : (
          <div className="grid gap-3 mb-4">
            {project.environments.map((env) => (
              <div
                key={env.id}
                className="border border-[var(--border)] bg-[var(--panel)] rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">{env.name}</p>
                    <p className="font-mono-key text-xs text-[var(--text-muted)]">{env.key}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <KeyRound size={13} className="text-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                    API Keys
                  </p>
                </div>

                {env.apiKeys.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] mb-3">No API keys yet.</p>
                ) : (
                  <ul className="mb-3 space-y-1.5">
                    {env.apiKeys.map((apiKey) => (
                      <li
                        key={apiKey.id}
                        className="flex items-center justify-between bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{apiKey.label}</span>
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">
                            {apiKey.type}
                          </span>
                        </div>
                          <ApiKeyDisplay apiKeyValue={apiKey.key} />
                      </li>
                    ))}
                  </ul>
                )}

                <form action={createApiKeyFromForm} className="flex gap-2">
                  <input type="hidden" name="environmentId" value={env.id} />
                  <input
                    type="text"
                    name="label"
                    placeholder="Key label"
                    required
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
                  />
                  <select
                    name="type"
                    defaultValue="SERVER"
                    className="bg-[var(--bg)] border border-[var(--border)] rounded-md px-2 text-sm"
                  >
                    <option value="SERVER">Server</option>
                    <option value="CLIENT">Client</option>
                  </select>
                  <button
                    type="submit"
                    className="text-sm px-3 py-1.5 rounded-md border border-[var(--border)] hover:border-[var(--signal-green)] transition-colors"
                  >
                    Create Key
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={createEnvironmentFromForm} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Environment name"
            required
            className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
          />
          <input
            type="text"
            name="key"
            placeholder="Environment key"
            required
            className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[var(--signal-green)] text-black text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus size={16} />
            Add
          </button>
        </form>
      </section>

      {/* Flags */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FlagIcon size={16} className="text-[var(--text-muted)]" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Flags
          </h2>
        </div>

        {project.flags.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm mb-4">No flags yet.</p>
        ) : (
          <ul className="grid gap-2 mb-4">
            {project.flags.map((flag) => (
              <li key={flag.id}>
                <Link
                  href={`/dashboard/${slug}/${flag.key}`}
                  className="group flex items-center justify-between border border-[var(--border)] bg-[var(--panel)] rounded-lg px-4 py-3 hover:border-[var(--signal-green)] transition-colors"
                >
                  <div>
                    <p className="font-mono-key text-sm">{flag.key}</p>
                    {flag.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{flag.description}</p>
                    )}
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-[var(--text-muted)] group-hover:text-[var(--signal-green)] group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form action={createFlagFromForm} className="flex gap-2">
          <input
            type="text"
            name="key"
            placeholder="Flag key"
            required
            className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-md px-3 py-2 text-sm font-mono-key placeholder:font-sans placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
          />
          <input
            type="text"
            name="description"
            placeholder="Description (optional)"
            className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[var(--signal-green)] text-black text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus size={16} />
            Add
          </button>
        </form>
      </section>
    </div>
  );
}