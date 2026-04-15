// app/api/groups/invite-link/route.ts

import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return Response.json({ error: "Missing groupId" }, { status: 400 });
    }

    // ✅ find existing active invite
    let invite = await prisma.groupInvite.findFirst({
      where: {
        groupId,
        accepted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ create if not exists
    if (!invite) {
      const token = randomBytes(32).toString("hex");

      invite = await prisma.groupInvite.create({
        data: {
          groupId,
          token,
          email: "link@share.com", // dummy
        },
      });
    }

    // ✅ safe origin (important for production)
    const origin = process.env.NEXTAUTH_URL || req.headers.get("origin");

    const inviteLink = `${origin}/invite/${invite.token}`;

    return Response.json({
      success: true,
      inviteLink,
    });
  } catch (error) {
    console.error("INVITE LINK ERROR:", error);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
