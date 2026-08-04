import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { createProject } from "@/actions/project";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function DashBoardPage(){
    const user = await getCurrentUser()

    const memberships = await prisma.membership.findMany({
        where: {userId:user.id},
        include:{project:true}
    })

    const projects = memberships.map((m)=>m.project)

    async function createProjectFromForm(formData:FormData){
         "use server"
         const name = String(formData.get("name")?? "").trim()

         if(!name) return;

         await createProject(name)
         revalidatePath("/dashboard")
    }

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

            <form action={createProjectFromForm}>
                <input type="text" name="name" placeholder="Project name" required/>
                <button type="submit">Create Project</button>
            </form>
        </div>
    )
}