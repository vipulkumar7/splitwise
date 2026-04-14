import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

// =========================
// GET GROUPS (Optimized)
// =========================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    // ✅ Avoid upsert → use findUnique (faster)
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
// CREATE GROUP (Optimized)
// =========================
export async function POST(req: Request) {
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

    // ✅ Only fetch id (lighter + faster)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Single DB call (nested create already optimal)
    const group = await prisma.group.create({
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

    return NextResponse.json(group);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
