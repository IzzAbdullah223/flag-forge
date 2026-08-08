"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function slugify(name:string):string{
    return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createProject(name:string){

    const user = await getCurrentUser()

    const baseSlug = slugify(name)
    let slug = baseSlug
    let attempt = 0

    while (await prisma.project.findUnique({where:{slug}})){
        attempt++;
        slug = `${baseSlug}-${attempt}`
    }

    const project = await prisma.project.create({
        data:{
            name,
            slug,
            memberships:{
                create:{userId:user.id, role:"OWNER"}
            }
        }
    })

    return project
}


export async function deleteProject(projectId: string) {
  const user = await getCurrentUser();

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!membership || membership.role !== "OWNER") {
    throw new Error("FORBIDDEN");
  }

  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { projectId } }),
    prisma.flagState.deleteMany({ where: { flag: { projectId } } }),
    prisma.apiKey.deleteMany({ where: { environment: { projectId } } }),
    prisma.flag.deleteMany({ where: { projectId } }),
    prisma.environment.deleteMany({ where: { projectId } }),
    prisma.membership.deleteMany({ where: { projectId } }),
    prisma.project.delete({ where: { id: projectId } }),
  ]);
}