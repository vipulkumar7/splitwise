import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const currentUserId = session.user.id;

    // =========================
    // 👥 GET FRIENDS (UNIQUE)
    // =========================
    const memberships = await prisma.groupMember.findMany({
      where: { userId: currentUserId },
      include: {
        group: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });

    const friendMap = new Map<string, any>();

    memberships.forEach((m) => {
      m.group.members.forEach((member) => {
        if (member.user.id !== currentUserId) {
          friendMap.set(member.user.id, member.user);
        }
      });
    });

    const friends = Array.from(friendMap.values());
    const friendIds = friends.map((f) => f.id);

    if (friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // =========================
    // 💸 FETCH SPLITS + SETTLEMENTS IN PARALLEL
    // =========================
    const [splits, settlements] = await Promise.all([
      prisma.split.findMany({
        where: {
          OR: [
            {
              userId: { in: friendIds },
              expense: { paidById: currentUserId },
            },
            {
              userId: currentUserId,
              expense: { paidById: { in: friendIds } },
            },
          ],
        },
        include: {
          expense: {
            select: { paidById: true },
          },
        },
      }),

      prisma.settlement.findMany({
        where: {
          OR: [
            { fromUserId: currentUserId, toUserId: { in: friendIds } },
            { fromUserId: { in: friendIds }, toUserId: currentUserId },
          ],
        },
      }),
    ]);

    // =========================
    // 🧠 COMPUTE BALANCES
    // =========================
    const balanceMap = new Map<string, number>();

    friendIds.forEach((id) => balanceMap.set(id, 0));

    // 💸 SPLITS
    splits.forEach((s) => {
      const paidBy = s.expense.paidById;

      if (paidBy === currentUserId && balanceMap.has(s.userId)) {
        balanceMap.set(s.userId, balanceMap.get(s.userId)! + s.amount);
      }

      if (s.userId === currentUserId && balanceMap.has(paidBy)) {
        balanceMap.set(paidBy, balanceMap.get(paidBy)! - s.amount);
      }
    });

    // 💰 SETTLEMENTS
    settlements.forEach((s) => {
      if (s.fromUserId === currentUserId) {
        balanceMap.set(
          s.toUserId,
          (balanceMap.get(s.toUserId) || 0) - s.amount,
        );
      }

      if (s.toUserId === currentUserId) {
        balanceMap.set(
          s.fromUserId,
          (balanceMap.get(s.fromUserId) || 0) + s.amount,
        );
      }
    });

    // =========================
    // 🎯 FINAL RESPONSE
    // =========================
    const result = friends.map((f) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      image: f.image ?? null,
      balance: Number((balanceMap.get(f.id) || 0).toFixed(2)),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("FRIENDS API ERROR:", error);

    return NextResponse.json([], { status: 500 }); // 👈 always return array
  }
}
