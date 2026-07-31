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