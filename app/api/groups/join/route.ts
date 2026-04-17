// app/api/groups/join/route.ts

import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // ✅ find invite
    const invite = await prisma.groupInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }

    // ✅ get or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
      },
    });

    // ✅ prevent duplicate
    const exists = await prisma.groupMember.findFirst({
      where: {
        groupId: invite.groupId,
        userId: user.id,
      },
    });

    if (!exists) {
      await prisma.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: user.id,
        },
      });
    }

    // ✅ mark invite used (optional)
    await prisma.groupInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    });

    return NextResponse.json({
      success: true,
      groupId: invite.groupId,
    });
  } catch (error) {
    console.error("JOIN ERROR:", error);

    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
}
