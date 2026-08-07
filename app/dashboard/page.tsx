import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { createProject } from "@/actions/project";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { project: true },
  });

  const projects = memberships.map((m) => m.project);

  async function createProjectFromForm(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    await createProject(name);
    revalidatePath("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Projects</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Manage feature flags across your projects and environments.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-lg py-16 text-center mb-8">
          <FolderKanban size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No projects yet — create one to get started.</p>
        </div>
      ) : (
        <ul className="grid gap-3 mb-8">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/${project.slug}`}
                className="group flex items-center justify-between border border-[var(--border)] bg-[var(--panel)] rounded-lg px-5 py-4 hover:border-[var(--signal-green)] transition-colors"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="font-mono-key text-xs text-[var(--text-muted)] mt-0.5">
                    {project.slug}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--text-muted)] group-hover:text-[var(--signal-green)] group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form action={createProjectFromForm} className="flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="New project name"
          required
          className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--signal-green)]"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-[var(--signal-green)] text-black text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Create
        </button>
      </form>
    </div>
  );
}