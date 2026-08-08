import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "./db";

export async function getCurrentUser() {
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

  return user;
}

export async function assertMembership(userId: string, projectId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}