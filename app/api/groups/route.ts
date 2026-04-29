import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// =========================
// GET GROUPS (OPTIMIZED)
// =========================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    // ✅ Single query (no separate user fetch)
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            user: {
              email: session.user.email,
            },
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

    // 🚀 TRANSACTION (atomic + fast)
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1️⃣ Upsert user
        const user = await tx.user.upsert({
          where: { email: session.user.email! },
          update: {},
          create: {
            email: session.user.email!,
            name: session.user.name || "User",
          },
          select: { id: true, name: true },
        });

        // 2️⃣ Create group + member in ONE go
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
            createdAt: true,
            updatedAt: true,
          },
        });

        // 3️⃣ Notification (no extra query needed)
        await tx.notification.create({
          data: {
            userId: user.id,
            groupId: group.id,
            type: "GROUP_CREATED",
            message: `You created group "${name}"`,
          },
        });

        // 4️⃣ Return full group (single read)
        const completeGroup = await tx.group.findUnique({
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

        return completeGroup;
      },
    );

    return NextResponse.json(result);
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
