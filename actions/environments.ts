"user server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/lib/db"

export async function createEnvionment(projectId:string,key:string,name:string){
    const {getUser} = getKindeServerSession()
    const kindeUser = await getUser()

    if(!kindeUser){
        throw new Error("UNAUTHORIZED")
    }

    const user = await prisma.user.findUnique({
        where:{id:kindeUser.id}
    })

    if(!user){
        throw new Error("USER_NOT_fOUND ")
    }

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