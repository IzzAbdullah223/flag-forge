"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/lib/db"


export async function createApiKey(environmentId: string, label:string, type: "SERVER" | "CLIENT"){
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

     if (!kindeUser) {
        throw new Error("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
     where: { kindeId: kindeUser.id },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
     }

    const environment = await prisma.environment.findUnique({
        where:{id:environmentId},
        include:{project:true}
    })

    if(!environment){
        throw new Error("NOT_FOUND")
    }

  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: environment.projectId } },
  });

  if(!membership){
    throw new Error("FORBIDDEN")
  }

  const apiKey = await prisma.apiKey.create({
    data:{label,type,environmentId}
  })

  return apiKey
}