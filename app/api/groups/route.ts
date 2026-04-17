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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🚀 TRANSACTION (group + notification)
    const result = await prisma.$transaction(async (tx: any) => {
      // ✅ create group
      const group = await tx.group.create({
        data: {
          name,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // 🔔 notification (optional but useful)
      await tx.notification.create({
        data: {
          userId: user.id,
          groupId: group.id,
          type: "GROUP_CREATED" as const,
          message: `You created group "${group.name}"`,
        },
      });

      return group;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
