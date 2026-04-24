import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { IFriend } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // 🔹 Get friends
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

    type Membership = Awaited<typeof memberships>[number];
    type SplitWithExpense = Awaited<typeof splits>[number];
    type Settlement = Awaited<typeof settlements>[number];
    type Member = Membership["group"]["members"][number];

    const friendMap = new Map<string, any>();

    memberships.forEach((m: Membership) => {
      m.group.members.forEach((member: Member) => {
        if (member.user.id !== currentUserId) {
          friendMap.set(member.user.id, member.user);
        }
      });
    });

    const friends = Array.from(friendMap.values());
    const friendIds = friends.map((f) => f.id);

    // 🔹 Batch fetch splits
    const splits = await prisma.split.findMany({
      where: {
        OR: [
          { userId: { in: friendIds }, expense: { paidById: currentUserId } },
          { userId: currentUserId, expense: { paidById: { in: friendIds } } },
        ],
      },
      include: { expense: true },
    });

    // 🔹 Batch fetch settlements
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { fromUserId: currentUserId, toUserId: { in: friendIds } },
          { fromUserId: { in: friendIds }, toUserId: currentUserId },
        ],
      },
    });

    // 🔹 Compute balances (in-memory)
    const balanceMap = new Map<string, number>();
    friendIds.forEach((id) => balanceMap.set(id, 0));

    splits.forEach((s: SplitWithExpense) => {
      const paidBy = s.expense.paidById;

      if (paidBy === currentUserId && balanceMap.has(s.userId)) {
        balanceMap.set(s.userId, balanceMap.get(s.userId)! + s.amount);
      }

      if (s.userId === currentUserId && balanceMap.has(paidBy)) {
        balanceMap.set(paidBy, balanceMap.get(paidBy)! - s.amount);
      }
    });

    settlements.forEach((s: Settlement) => {
      if (s.fromUserId === currentUserId) {
        balanceMap.set(s.toUserId, balanceMap.get(s.toUserId)! - s.amount);
      }

      if (s.toUserId === currentUserId) {
        balanceMap.set(s.fromUserId, balanceMap.get(s.fromUserId)! + s.amount);
      }
    });

    const result = friends.map((f: IFriend) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      image: f.image ?? null,
      balance: Number((balanceMap.get(f.id as string) || 0).toFixed(2)),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
