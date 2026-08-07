"use server"
import { getCurrentUser } from "@/lib/auth"
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