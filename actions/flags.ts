"use server"

import { getCurrentUser } from "@/lib/auth";
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

