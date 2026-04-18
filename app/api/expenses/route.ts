import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { IMember, ISplit, ISplitsInput } from "@/types";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Safe parsing
    const body = await req.json().catch(() => null);

    const amount = Number(body?.amount);
    const description = body?.description || "";
    const groupId = body?.groupId;
    const payerId = body?.payerId;
    const splitType = body?.splitType || "equal";
    const splits = body?.splits || {};

    // ⚠️ Fix: amount check
    if (amount == null || !groupId || !payerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // =========================
    // 🚀 TRANSACTION
    // =========================
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // ✅ Create expense
        const expense = await tx.expense.create({
          data: {
            amount,
            description,
            groupId,
            paidById: payerId,
          },
          select: { id: true },
        });

        // ✅ Get members
        const members = await tx.groupMember.findMany({
          where: { groupId },
          select: { userId: true },
        });

        // ==============================
        // 🔔 NOTIFICATIONS
        // ==============================

        const payer = await tx.user.findUnique({
          where: { id: payerId },
          select: { name: true },
        });

        const notificationData = members
          .filter((m: IMember) => m.userId !== payerId)
          .map((m: IMember) => ({
            userId: m.userId,
            groupId,
            type: "EXPENSE_ADDED" as const,
            message: `${payer?.name || "Someone"} added ₹${amount} for ${description}`,
          }));

        if (notificationData.length > 0) {
          await tx.notification.createMany({
            data: notificationData,
          });
        }

        // =========================
        // 💸 SPLITS
        // =========================
        let splitData: ISplit[] = [];

        if (splitType === "equal") {
          const splitAmount = amount / members.length;

          splitData = members.map((m: IMember) => ({
            userId: m.userId,
            expenseId: expense.id,
            amount: splitAmount,
          }));
        }

        if (splitType === "custom") {
          splitData = Object.entries(splits as ISplitsInput).map(
            ([userId, value]) => ({
              userId,
              expenseId: expense.id,
              amount: Number(value),
            }),
          );
        }

        // ✅ Only splits here (notification already handled)
        if (splitData.length > 0) {
          await tx.split.createMany({ data: splitData });
        }

        return expense.id;
      },
    );

    return NextResponse.json({
      success: true,
      expenseId: result,
    });
  } catch (error) {
    console.error("EXPENSE ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
