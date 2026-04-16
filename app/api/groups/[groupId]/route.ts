import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// =========================
// GET
// =========================
export async function GET(
  req: Request,
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
// DELETE (OPTIMIZED)
// =========================
export async function DELETE(
  _req: Request,
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
  } catch (error: any) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Delete failed", details: error.message },
      { status: 500 },
    );
  }
}

// =========================
// PUT (UPDATE GROUP NAME)
// =========================
export async function PUT(
  req: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const { groupId } = await context.params;
    const body = await req.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("UPDATE GROUP ERROR:", err);

    return NextResponse.json(
      { error: "Failed", details: err.message },
      { status: 500 },
    );
  }
}
