import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { createEnvionment } from "@/actions/environments";
import { createFlag } from "@/actions/flags";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createApiKey } from "@/actions/apiKeys";

type ProjectPageProps = {
    params: Promise<{slug:string}>;
}

export default async function ProjectPage({params}:ProjectPageProps){
    const {slug} = await params;
    const user = await getCurrentUser()

const project = await prisma.project.findUnique({
  where: { slug },
  include: {
    environments: { include: { apiKeys: true } },
    flags: true,
  },
});

    if(!project){
        notFound()
    }

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
  });

  if (!membership) {
    notFound();
  }

  async function createEnvironmentFromForm(formData:FormData){
    "use server"
    const name = String(formData.get("name") ?? "").trim();
    const key = String(formData.get("key") ?? "").trim();

    if(!name || !key) return;

    await createEnvionment(project!.id,name,key)
    revalidatePath(`/dashboard/${slug}`);
  }

  async function createFlagFromForm(formData:FormData){
    "use server"
    const key = String(formData.get("key") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if(!key) return;

    await createFlag(project!.id,key,description || undefined);
    revalidatePath(`/dashboard/${slug}`)
  }

  async function createApiKeyFromForm(formData:FormData){
    "use server"
    const environmentId = String(formData.get("environmentId")?? "")
    const label = String(formData.get("label")?? "")
    const type = String (formData.get("type")?? "SERVER") as "SERVER" | "CLIENT";

    if (!environmentId || !label) return;

    await createApiKey(environmentId,label,type)
    revalidatePath(`/dashboard/${slug}`);
  }

  return (
    <div>
      <h1>{project.name}</h1>

      <h2>Environments</h2>
      {project.environments.length === 0 ? (
        <p>No environments yet.</p>
      ) : (
        <ul>
          {project.environments.map((env) => (
            <li key={env.id}>
              <p>{env.name} ({env.key})</p>
            <hr></hr>
              <p>API Keys:</p>
              {env.apiKeys.length === 0 ? (
                <p>No API keys yet.</p>
              ) : (
                <ul>
                  {env.apiKeys.map((apiKey) => (
                    <li key={apiKey.id}>
                      {apiKey.label} ({apiKey.type}): {apiKey.key}
                    </li>
                  ))}
                </ul>
              )}
              

              <form action={createApiKeyFromForm}>
                <input type="hidden" name="environmentId" value={env.id} />
                <input type="text" name="label" placeholder="Key label" required />
                <select name="type" defaultValue="SERVER">
                  <option value="SERVER">Server</option>
                  <option value="CLIENT">Client</option>
                </select>
                <button type="submit">Create API Key</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={createEnvironmentFromForm}>
        <input type="text" name="name" placeholder="Environment name" required />
        <input type="text" name="key" placeholder="Environment key" required />
        <button type="submit">Add Environment</button>
      </form>
      <hr></hr>
      <h2>Flags</h2>
      {project.flags.length === 0 ? (
        <p>No flags yet.</p>
      ) : (
        <ul>
          {project.flags.map((flag) => (
            <li key={flag.id}>
              <Link href={`/dashboard/${slug}/${flag.key}`}>{flag.key}</Link>
              {flag.description ? ` — ${flag.description}` : ""}
            </li>
          ))}
        </ul>
      )}
      <form action={createFlagFromForm}>
        <input type="text" name="key" placeholder="Flag key" required />
        <input type="text" name="description" placeholder="Description (optional)" />
        <button type="submit">Add Flag</button>
      </form>
    </div>
  );
}