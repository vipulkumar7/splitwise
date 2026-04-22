import FriendsPageClient from "@/features/friends/FriendsPageClient";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { GroupWithRelations, IGroup, ISettlement } from "@/types";
import { calculateFriendBalances } from "@/utils/calculateFriendBalance";
import { buildFriendsFromBalances, getGroups } from "@/utils/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const currentUserId = dbUser.id;

  const groups: GroupWithRelations[] = await getGroups(currentUserId);

  const settlements: ISettlement[] = await prisma.settlement.findMany({
    where: {
      OR: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
    },
  });

  const balanceMap = calculateFriendBalances(
    groups,
    currentUserId,
    settlements,
  );

  const friendsRaw = buildFriendsFromBalances(
    groups,
    balanceMap,
    currentUserId,
  );

  const friends = friendsRaw.map((f) => ({
    id: f.id,
    name: f.name,
    email: f.email,
    image: f.image ?? null,
    balance: Number(f.balance.toFixed(2)),
  }));

  return <FriendsPageClient friends={friends} />;
}
