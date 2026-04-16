import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get user from DB (no need from frontend)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await prisma.groupMember.deleteMany({
      where: {
        groupId: groupId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "User not in group" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("EXIT GROUP ERROR:", error);

    return NextResponse.json(
      { error: "Failed to exit group" },
      { status: 500 },
    );
  }
}
