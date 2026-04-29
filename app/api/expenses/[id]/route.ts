import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { normalizeDate } from "@/utils/utils";

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
    const { description, amount, payerId, date } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 400 },
      );
    }

    const normalizedDate = date ? normalizeDate(date) : new Date();

    // 🔥 Fetch participants FIRST
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: {
        groupId: true,
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // =========================
    // 👥 USERS (SAFE SOURCE)
    // =========================
    let users = existing.participants.map((p) => p.userId);

    // 🔥 Fallback for OLD expenses (no participants)
    if (users.length === 0) {
      const oldSplits = await prisma.split.findMany({
        where: { expenseId: id },
        select: { userId: true },
      });

      users = oldSplits.map((s) => s.userId);
    }

    if (!users.length) {
      return NextResponse.json(
        { error: "No participants found" },
        { status: 400 },
      );
    }

    // =========================
    // 🚀 TRANSACTION
    // =========================
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Update expense
      const updated = await tx.expense.update({
        where: { id },
        data: {
          description,
          amount: Number(amount),
          paidById: payerId,
          createdAt: normalizedDate,
        },
      });

      // 2️⃣ Replace splits (STRICTLY SAME USERS)
      await tx.split.deleteMany({
        where: { expenseId: id },
      });

      const splitAmount = Number((Number(amount) / users.length).toFixed(2));

      await tx.split.createMany({
        data: users.map((userId) => ({
          userId,
          expenseId: id,
          amount: splitAmount,
        })),
      });

      // 3️⃣ Ensure participants exist (important for old data)
      await tx.expenseParticipant.deleteMany({
        where: { expenseId: id },
      });

      await tx.expenseParticipant.createMany({
        data: users.map((userId) => ({
          userId,
          expenseId: id,
        })),
      });

      // 4️⃣ Fetch payer (single call)
      const payer = await tx.user.findUnique({
        where: { id: payerId },
        select: { name: true },
      });

      // 5️⃣ Notifications
      await tx.notification.createMany({
        data: users.map((userId) => ({
          userId,
          groupId: existing.groupId,
          type: "EXPENSE_UPDATED",
          message: `${payer?.name || "Someone"} updated ₹${amount} for ${description}`,
        })),
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PUT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Update failed" },
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
    // 🔥 Fetch participants (SOURCE OF TRUTH)
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: {
        groupId: true,
        description: true,
        paidById: true,
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 404 },
      );
    }

    // =========================
    // 👥 USERS (SAFE SOURCE)
    // =========================
    let users = existing.participants.map((p) => p.userId);

    // 🔥 Fallback (old data)
    if (users.length === 0) {
      const oldSplits = await prisma.split.findMany({
        where: { expenseId: id },
        select: { userId: true },
      });

      users = oldSplits.map((s) => s.userId);
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch payer once
      const payer = await tx.user.findUnique({
        where: { id: existing.paidById },
        select: { name: true },
      });

      // 2️⃣ Notifications
      await tx.notification.createMany({
        data: users.map((userId) => ({
          userId,
          groupId: existing.groupId,
          type: "EXPENSE_DELETED",
          message: `${payer?.name || "Someone"} deleted expense "${existing.description}"`,
        })),
      });

      // 3️⃣ Delete everything safely
      await Promise.all([
        tx.split.deleteMany({ where: { expenseId: id } }),
        tx.expenseParticipant.deleteMany({ where: { expenseId: id } }),
        tx.expense.delete({ where: { id } }),
      ]);
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
