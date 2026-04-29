import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

// =========================
// 📦 GET GROUP DETAILS
// =========================
// 👉 Fetch group with members + expenses (lightweight & optimized)
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { groupId } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch only required fields + auth check
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            user: { email: session.user.email },
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,

        // 👥 Members (light)
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

        // 💸 Expenses (optimized)
        expenses: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,

            paidById: true,
            paidBy: {
              select: {
                id: true,
                name: true,
              },
            },

            splits: {
              select: {
                userId: true,
                amount: true,
              },
            },

            // ✅ Store who was part of expense at creation time
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("GET GROUP ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// =========================
// 🗑 DELETE GROUP
// =========================
// 👉 Delete group + all related data safely in one transaction
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { groupId } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check access (important)
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🚀 Transaction (parallel deletes)
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // delete splits → expenses → members → invites → group
      await Promise.all([
        tx.split.deleteMany({
          where: { expense: { groupId } },
        }),
        tx.expense.deleteMany({
          where: { groupId },
        }),
        tx.groupMember.deleteMany({
          where: { groupId },
        }),
        tx.groupInvite.deleteMany({
          where: { groupId },
        }),
      ]);

      await tx.group.delete({
        where: { id: groupId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE GROUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Delete failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =========================
// ✏️ UPDATE GROUP NAME
// =========================
// 👉 Rename group (secure + minimal query)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { groupId } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // ✅ Ensure user belongs to group
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        user: { email: session.user.email },
      },
      select: { id: true },
    });

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Update minimal fields
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("UPDATE GROUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
