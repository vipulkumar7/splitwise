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

    if (!amount || !groupId || !payerId) {
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

        // ✅ Get members (lightweight)
        const members = await tx.groupMember.findMany({
          where: { groupId },
          select: { userId: true },
        });

        // =========================
        // 🔔 NOTIFICATIONS
        // =========================
        const notifications = members
          .filter((m: IMember) => m.userId !== payerId)
          .map((m: IMember) => ({
            userId: m.userId,
            message: `${description} added in group 💸`,
          }));

        // =========================
        // 💸 SPLITS
        // =========================
        let splitData: ISplit[] = [];

        if (splitType === "equal") {
          const splitAmount = amount / members.length;

          splitData = (members as IMember[]).map((m) => ({
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

        // ✅ Run in parallel inside transaction
        await Promise.all([
          notifications.length &&
            tx.notification.createMany({ data: notifications }),

          splitData.length && tx.split.createMany({ data: splitData }),
        ]);

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
