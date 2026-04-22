// app/api/friends/route.ts

import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // 1️⃣ Get all friends (users in same groups except self)
    const memberships = await prisma.groupMember.findMany({
      where: { userId: currentUserId },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Flatten + remove self
    const friendMap = new Map();

    memberships.forEach((m) => {
      m.group.members.forEach((member) => {
        if (member.user.id !== currentUserId) {
          friendMap.set(member.user.id, member.user);
        }
      });
    });

    const friends = Array.from(friendMap.values());

    // 2️⃣ Compute balances (YOUR LOGIC HERE ✅)
    const balances = await Promise.all(
      friends.map(async (friend) => {
        const friendOwes = await prisma.split.aggregate({
          _sum: { amount: true },
          where: {
            userId: friend.id,
            expense: {
              paidById: currentUserId,
            },
          },
        });

        const youOwe = await prisma.split.aggregate({
          _sum: { amount: true },
          where: {
            userId: currentUserId,
            expense: {
              paidById: friend.id,
            },
          },
        });

        const paidToFriend = await prisma.settlement.aggregate({
          _sum: { amount: true },
          where: {
            fromUserId: currentUserId,
            toUserId: friend.id,
          },
        });

        const receivedFromFriend = await prisma.settlement.aggregate({
          _sum: { amount: true },
          where: {
            fromUserId: friend.id,
            toUserId: currentUserId,
          },
        });

        const balance =
          (friendOwes._sum.amount || 0) -
          (youOwe._sum.amount || 0) -
          (paidToFriend._sum.amount || 0) +
          (receivedFromFriend._sum.amount || 0);

        return {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          balance,
        };
      }),
    );

    return NextResponse.json(balances);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
