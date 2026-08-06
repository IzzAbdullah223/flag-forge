"use server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { RuleGroup } from "@/lib/evaluation/rules";
import { Prisma } from "@/generated/prisma/client";
import { broadcastFlagChange } from "@/lib/sse";

async function assertMembership(userId: string, projectId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }
}

export async function getOrCreateFlagState(flagId: string, environmentId: string) {
  const user = await getCurrentUser();

  const flag = await prisma.flag.findUnique({ where: { id: flagId } });
  if (!flag) {
    throw new Error("NOT_FOUND");
  }

  await assertMembership(user.id, flag.projectId);

  const existing = await prisma.flagState.findUnique({
    where: { flagId_environmentId: { flagId, environmentId } },
  });

  if (existing) {
    return existing;
  }

  const flagState = await prisma.flagState.create({
    data: { flagId, environmentId },
  });

  return flagState;
}

export async function updateFlagState(
  flagId: string,
  environmentId: string,
  updates: {
    enabled?: boolean;
    rolloutPercent?: number;
    rules?: RuleGroup | null;
  }
) {
  const user = await getCurrentUser();

  const flag = await prisma.flag.findUnique({ where: { id: flagId } });
  if (!flag) {
    throw new Error("NOT_FOUND");
  }

  await assertMembership(user.id, flag.projectId);

  const flagState = await prisma.flagState.update({
    where: { flagId_environmentId: { flagId, environmentId } },
    data: {
      ...updates,
      rules: updates.rules === null ? Prisma.JsonNull : (updates.rules as Prisma.InputJsonValue | undefined),
    },
  });

  broadcastFlagChange(environmentId, flag.key);

  return flagState;
}