"use server"
import { getCurrentUser, assertMembership } from "@/lib/auth";
import prisma from "@/lib/db"


export async function createEnvironment(projectId:string,key:string,name:string){
    const user = await getCurrentUser()

    const memberShip = await prisma.membership.findUnique({
        where:{userId_projectId:{userId: user.id, projectId}}
    })

    if(!memberShip){
        throw new Error("FORBIDDEN")
    }

    const environment = await prisma.environment.create({
        data:{name,key,projectId}
    })

    return environment

}




export async function deleteEnvironment(environmentId: string) {
  const user = await getCurrentUser();

  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
  });

  if (!environment) {
    throw new Error("NOT_FOUND");
  }

  await assertMembership(user.id, environment.projectId);

  await prisma.$transaction([
    prisma.flagState.deleteMany({ where: { environmentId } }),
    prisma.apiKey.deleteMany({ where: { environmentId } }),
    prisma.environment.delete({ where: { id: environmentId } }),
  ]);
}



