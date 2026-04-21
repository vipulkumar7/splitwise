import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

// =========================
// GET GROUPS
// =========================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        expenses: {
          select: {
            id: true,
            amount: true,
            paidById: true,
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (err) {
    console.error("GET GROUPS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// =========================
// CREATE GROUP
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.upsert({
      where: { email: session.user.email! },
      update: {},
      create: {
        email: session.user.email!,
        name: session.user.name || "User",
      },
    });

    const userId = dbUser.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Create group first
    const group = await prisma.group.create({
      data: {
        name,
      },
    });

    // ✅ Add user as member
    await prisma.groupMember.create({
      data: {
        userId: userId,
        groupId: group.id,
      },
    });

    // ✅ Fetch complete group data
    const completeGroup = await prisma.group.findUnique({
      where: { id: group.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        expenses: {
          select: {
            id: true,
            amount: true,
            paidById: true,
          },
        },
      },
    });

    // 🔔 Create notification
    await prisma.notification.create({
      data: {
        userId: userId,
        groupId: group.id,
        type: "GROUP_CREATED",
        message: `You created group "${group.name}"`,
      },
    });

    return NextResponse.json(completeGroup);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
