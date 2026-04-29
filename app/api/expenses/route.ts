import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { normalizeDate } from "@/utils/utils";

// ======================
// ✏️ CREATE EXPENSE
// ======================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const amount = Number(body?.amount);
    const date = body?.date ? normalizeDate(body.date) : new Date();
    const description = body?.description?.trim() || "";
    const groupId = body?.groupId;
    const payerId = body?.payerId;
    const splitType = body?.splitType || "equal";
    const splits = body?.splits || {};

    if (!amount || amount <= 0 || !groupId || !payerId) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const expenseId = await prisma.$transaction(async (tx) => {
      // ✅ Members at time of expense
      const members = await tx.groupMember.findMany({
        where: {
          groupId,
          joinedAt: { lte: date },
        },
        select: { userId: true, user: { select: { name: true } } },
      });

      if (!members.length) throw new Error("No members found");

      // 1️⃣ Create expense
      const expense = await tx.expense.create({
        data: {
          amount,
          description,
          groupId,
          paidById: payerId,
          createdAt: date,
        },
        select: { id: true },
      });

      // 2️⃣ 🔥 Store participants (SOURCE OF TRUTH)
      await tx.expenseParticipant.createMany({
        data: members.map((m) => ({
          expenseId: expense.id,
          userId: m.userId,
        })),
      });

      // 3️⃣ 💸 Create splits
      let splitData: any[] = [];

      if (splitType === "equal") {
        const splitAmount = Number((amount / members.length).toFixed(2));

        splitData = members.map((m) => ({
          userId: m.userId,
          expenseId: expense.id,
          amount: splitAmount,
        }));
      }

      if (splitType === "custom") {
        const total = Object.values(splits).reduce(
          (acc: number, val: any) => acc + Number(val),
          0,
        );

        if (total !== amount) throw new Error("Split mismatch");

        splitData = Object.entries(splits).map(([userId, val]) => ({
          userId,
          expenseId: expense.id,
          amount: Number(val),
        }));
      }

      if (splitData.length) {
        await tx.split.createMany({ data: splitData });
      }

      // 4️⃣ 🔔 Notifications
      const payerName =
        members.find((m) => m.userId === payerId)?.user?.name || "Someone";

      await tx.notification.createMany({
        data: members
          .filter((m) => m.userId !== payerId)
          .map((m) => ({
            userId: m.userId,
            groupId,
            type: "EXPENSE_ADDED",
            message: `${payerName} added ₹${amount} for ${description}`,
          })),
      });

      return expense.id;
    });

    return NextResponse.json({ success: true, expenseId });
  } catch (error: any) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
