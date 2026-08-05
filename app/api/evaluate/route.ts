import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { evaluateFlag, FlagStateInput } from "@/lib/evaluation/evaluator";
import { UserContext } from "@/lib/evaluation/rules";
import { RuleGroup } from "@/lib/evaluation/rules";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header" },
      { status: 401 }
    );
  }

  const key = authHeader.replace("Bearer ", "");

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });

  if (!apiKey || apiKey.revoked) {
    return NextResponse.json(
      { error: "Invalid or revoked API key" },
      { status: 401 }
    );
  }

  const shouldUpdate =
    !apiKey.lastUsedAt || Date.now() - apiKey.lastUsedAt.getTime() > 5 * 60 * 1000;

  if (shouldUpdate) {
    prisma.apiKey
      .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});
  }

  const environmentId = apiKey.environmentId;

  const body = await req.json();
  const { flagKey, user } = body;

  if (!flagKey || !user?.userId) {
    return NextResponse.json(
      { error: "flagKey and user.userId are required" },
      { status: 400 }
    );
  }

  const flag = await prisma.flag.findFirst({
    where: { key: flagKey, project: { environments: { some: { id: environmentId } } } },
    include: { flagStates: { where: { environmentId } } },
  });

  if (!flag || flag.flagStates.length === 0) {
    return NextResponse.json({ flagKey, enabled: false, reason: "FLAG_NOT_FOUND" });
  }

  const flagState = flag.flagStates[0];

const rawRules = flagState.rules;
const rules = Array.isArray(rawRules) ? null : (rawRules as RuleGroup | null);

const input: FlagStateInput = {
  enabled: flagState.enabled,
  rolloutPercent: flagState.rolloutPercent,
  rules,
};

  const result = evaluateFlag(flagKey, input, user as UserContext);

  return NextResponse.json(result);
}