import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const { groupId } = await context.params;

    if (!groupId) {
      return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
    }

    let invite = await prisma.groupInvite.findFirst({
      where: {
        groupId,
        accepted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!invite) {
      const token = randomBytes(32).toString("hex");

      invite = await prisma.groupInvite.create({
        data: {
          groupId,
          token,
        },
      });
    }

    const origin = process.env.NEXTAUTH_URL || req.headers.get("origin");

    const inviteLink = `${origin}/invite/${invite.token}`;

    return NextResponse.json({ inviteLink });
  } catch (err: unknown) {
    console.error("INVITE ERROR:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 },
    );
  }
}
