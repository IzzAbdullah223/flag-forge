import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";


export async function GET(){
    const {getUser} = getKindeServerSession()

    const kindeUser = await getUser()

    if(!kindeUser){
        redirect("/")
    }

    await prisma.user.upsert({
        where:{kindeId:kindeUser.id},
        update:{
            email: kindeUser.email ?? "",
            name: `${kindeUser.given_name ?? ""} ${kindeUser.family_name ?? ""}`.trim()
        },
        create:{
            kindeId: kindeUser.id,
            email: kindeUser.email ?? "",
            name: `${kindeUser.given_name ?? ""} ${kindeUser.family_name ?? ""}`.trim()
        },
    });

    redirect("/dashboard")
}