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

    // ✅ Safe parsing
    const body = await req.json().catch(() => null);
    const userId = body?.userId;
    const groupId = body?.groupId;

    if (!userId || !groupId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Only fetch id (lighter query)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // =========================
    // ✅ DELETE
    // =========================
    const result = await prisma.groupMember.deleteMany({
      where: {
        userId,
        groupId,
      },
    });

    // Optional safety
    if (result.count === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REMOVE MEMBER ERROR:", err);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
