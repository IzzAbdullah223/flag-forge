import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { getOrCreateFlagState, updateFlagState } from "@/actions/flagStates";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

type FlagPageProps ={
    params:Promise<{slug:string; flagKey:string}>
}

export default async function FlagPage({params}:FlagPageProps){
    const {slug,flagKey} = await params
    const user = await getCurrentUser()

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { environments: true },
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

  const flag = await prisma.flag.findUnique({
    where: { projectId_key: { projectId: project.id, key: flagKey } },
  });

  if (!flag) {
    notFound();
  }

  const flagStates = await Promise.all(
    project.environments.map((env)=>getOrCreateFlagState(flag!.id,env.id))
  )

  async function updateFlagStateFromForm(formData:FormData){
    "use server"
    const environmentId = String(formData.get("environmentId") ?? "");
    const enabled = formData.get("enabled") === "on";
    const rolloutPercent = Number(formData.get("rolloutPercent") ?? 0);
    await updateFlagState(flag!.id, environmentId, { enabled, rolloutPercent });
    revalidatePath(`/dashboard/${slug}/${flagKey}`);
  }

  return (
    <div>
      <h1>{flag.key}</h1>
      {flag.description ? <p>{flag.description}</p> : null}

      <h2>Environments</h2>
      {project.environments.map((env, i) => {
        const state = flagStates[i];
        return (
          <form action={updateFlagStateFromForm} key={env.id}>
            <input type="hidden" name="environmentId" value={env.id} />
            <p>{env.name}</p>
            <label>
              <input type="checkbox" name="enabled" defaultChecked={state.enabled} />
              Enabled
            </label>
            <label>
              Rollout %:
              <input
                type="number"
                name="rolloutPercent"
                defaultValue={state.rolloutPercent}
                min={0}
                max={100}
              />
            </label>
            <button type="submit">Save</button>
          </form>
        );
      })}
    </div>
  );

}