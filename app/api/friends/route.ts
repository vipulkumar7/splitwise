
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { getGroups } from "@/utils/utils";
import { calculateFriendBalances } from "@/utils/calculateFriendBalance";
import { buildFriendsFromBalances } from "@/utils/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }
    const currentUserId = session.user.id;

    // 1. Fetch all groups with members, expenses, splits, participants
    const groups = await getGroups(currentUserId);

    // 2. Fetch all settlements involving the user
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { fromUserId: currentUserId },
          { toUserId: currentUserId },
        ],
      },
    });

    // 3. Calculate balances for all group members (except self)
    const balanceMap = calculateFriendBalances(groups, currentUserId, settlements);

    // 4. Build friend list from all group members (except self)
    const friends = buildFriendsFromBalances(groups, balanceMap, currentUserId);

    return NextResponse.json(friends);
  } catch (error) {
    console.error("FRIENDS API ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
