import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/sse";
import prisma from "@/lib/db";

export async function GET(req:NextRequest){
   const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Missing or malformed Authorization header", { status: 401 });
  }

    const key = authHeader.replace("Bearer ", "");

    const apiKey = await prisma.apiKey.findUnique({
        where:{key}
    })

  if (!apiKey || apiKey.revoked) {
    return new Response("Invalid or revoked API key", { status: 401 });
  }

    const environmentId = apiKey.environmentId;

    const stream = new ReadableStream({
        start(controller){
            
            const client = addClient(environmentId,controller);

            controller.enqueue(new TextEncoder().encode(`: connected\n\n`));    

            req.signal.addEventListener("abort",()=>{
                removeClient(environmentId, client );
                controller.close()
            })
        }
    })

    
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

}