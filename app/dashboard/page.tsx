import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function DashBoardPage(){
    const user = await getCurrentUser()

    const memberships = await prisma.membership.findMany({
        where: {userId:user.id},
        include:{project:true}
    })

    const projects = memberships.map((m)=>m.project)

    return(
        <div>
            <h1>Your Projects</h1>

            {projects.length === 0?(
                <p>You don't have any projects yet.</p>
            ):(
                <ul>
                    {projects.map((project)=>(
                        <li key={project.id}>
                            <Link href={`/dashboard/${project.slug}`}>{project.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}