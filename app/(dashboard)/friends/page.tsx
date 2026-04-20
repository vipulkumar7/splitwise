import FriendsPageClient from "@/features/friends/FriendsPageClient";
import { authOptions } from "@/lib/auth/auth";
import { calculateFriendBalances } from "@/utils/calculateFriendBalance";
import { buildFriendsFromBalances, getGroups } from "@/utils/utils";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const currentUserId = session?.user?.id ?? undefined;
  const groups = await getGroups(currentUserId);
  const balanceMap = calculateFriendBalances(groups as any, currentUserId);
  const friends = buildFriendsFromBalances(
    groups as any,
    balanceMap,
    currentUserId,
  );

  return <FriendsPageClient friends={friends} />;
}
