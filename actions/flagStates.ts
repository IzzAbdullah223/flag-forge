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

  return membership;
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

  const before = await prisma.flagState.findUnique({
    where: { flagId_environmentId: { flagId, environmentId } },
  });

  const flagState = await prisma.flagState.update({
    where: { flagId_environmentId: { flagId, environmentId } },
    data: {
      ...updates,
      rules: updates.rules === null ? Prisma.JsonNull : (updates.rules as Prisma.InputJsonValue | undefined),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "FLAG_STATE_UPDATED",
      targetType: flag.key,
      targetId: flagState.id,
      before: before ? JSON.parse(JSON.stringify(before)) : Prisma.JsonNull,
      after: JSON.parse(JSON.stringify(flagState)),
      projectId: flag.projectId,
      userId: user.id,
    },
  });

  broadcastFlagChange(environmentId, flag.key);

  return flagState;
}