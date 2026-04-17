import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const { groupId } = await context.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: true },
        },
        expenses: {
          include: {
            splits: true,
            paidBy: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

// =========================
// DELETE
// =========================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const { groupId } = await context.params;

    // 🚀 single transaction (fast + safe)
    await prisma.$transaction([
      prisma.split.deleteMany({
        where: {
          expense: { groupId },
        },
      }),
      prisma.expense.deleteMany({
        where: { groupId },
      }),
      prisma.groupMember.deleteMany({
        where: { groupId },
      }),
      prisma.groupInvite.deleteMany({
        where: { groupId },
      }),
      prisma.group.delete({
        where: { id: groupId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE ERROR:", error);

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
// PUT (UPDATE GROUP NAME)
// =========================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const { groupId } = await context.params;
    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("UPDATE GROUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Delete failed",
        details: error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 },
    );
  }
}
