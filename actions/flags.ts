"use server"

import { getCurrentUser, assertMembership } from "@/lib/auth";
import prisma from "@/lib/db";

export async function createFlag(projectId:string,key:string,description?:string){
    const user = await getCurrentUser()

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  const flag = await prisma.flag.create({
    data:{key,description,projectId}
  })

  return flag
}


export async function deleteFlag(flagId: string) {
  const user = await getCurrentUser();

  const flag = await prisma.flag.findUnique({ where: { id: flagId } });
  if (!flag) {
    throw new Error("NOT_FOUND");
  }

  await assertMembership(user.id, flag.projectId);

  await prisma.$transaction([
    prisma.flagState.deleteMany({ where: { flagId } }),
    prisma.flag.delete({ where: { id: flagId } }),
  ]);
}
