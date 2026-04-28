import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// ======================
// ✏️ UPDATE EXPENSE
// ======================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { description, amount, payerId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 400 },
      );
    }

    // 🔍 get existing expense (needed for groupId)
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: { groupId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // 🚀 TRANSACTION (update + notification)
    const result = await prisma.$transaction(async (tx: any) => {
      // ✅ update expense
      const updated = await tx.expense.update({
        where: { id },
        data: {
          description,
          amount: Number(amount),
          paidById: payerId,
          createdAt: new Date(body.date),
        },
      });

      // 👥 get members
      const members = await tx.groupMember.findMany({
        where: { groupId: existing.groupId },
        select: { userId: true },
      });

      // 👤 payer name
      const payer = await tx.user.findUnique({
        where: { id: payerId },
        select: { name: true },
      });

      // 🔔 notifications
      await tx.notification.createMany({
        data: members.map((m: any) => ({
          userId: m.userId,
          groupId: existing.groupId,
          type: "EXPENSE_UPDATED" as const,
          message: `${payer?.name || "Someone"} updated ₹${amount} for ${description}`,
        })),
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 },
    );
  }
}

// ======================
// 🗑 DELETE EXPENSE
// ======================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    // 🔍 get existing expense (needed for notification)
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: {
        groupId: true,
        description: true,
        paidById: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 404 },
      );
    }

    // 🚀 TRANSACTION
    await prisma.$transaction(async (tx: any) => {
      // 👥 members
      const members = await tx.groupMember.findMany({
        where: { groupId: existing.groupId },
        select: { userId: true },
      });

      // 👤 payer
      const payer = await tx.user.findUnique({
        where: { id: existing.paidById },
        select: { name: true },
      });

      // 🔔 notifications BEFORE delete
      await tx.notification.createMany({
        data: members.map((m: any) => ({
          userId: m.userId,
          groupId: existing.groupId,
          type: "EXPENSE_DELETED" as const,
          message: `${payer?.name || "Someone"} deleted expense "${existing.description}"`,
        })),
      });

      // 🗑 delete splits
      await tx.split.deleteMany({
        where: { expenseId: id },
      });

      // 🗑 delete expense
      await tx.expense.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 },
    );
  }
}
