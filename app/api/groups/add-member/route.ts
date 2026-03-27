import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, groupId } = await req.json();

    if (!email || !groupId) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // 🔍 logged-in user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return Response.json({ error: "Current user not found" }, { status: 404 });
    }

    // 🔍 user to be added
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // ❌ prevent adding yourself
    if (currentUser.email === email) {
      return Response.json(
        { error: "You are already in group" },
        { status: 400 }
      );
    }

    // ❌ prevent duplicate
    const existing = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (existing) {
      return Response.json(
        { error: "Already added" },
        { status: 400 }
      );
    }

    // ✅ add member
    await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
      },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Add member error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}