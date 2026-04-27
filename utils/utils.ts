import { prisma } from "@/lib/db/prisma";
import { GroupWithRelations } from "@/types";
import { IFriend } from "@/types/models/friend";

export function buildFriendsFromBalances(
  groups: GroupWithRelations[],
  balanceMap: Record<string, number>,
  currentUserId?: string,
): IFriend[] {
  const userMap = new Map<string, IFriend>();

  for (const group of groups) {
    for (const member of group.members) {
      const user = member.user;

      // ✅ Safety checks
      if (!user) continue;
      if (currentUserId && user.id === currentUserId) continue;

      // ✅ Prevent duplicates
      if (!userMap.has(user.id)) {
        userMap.set(user.id, {
          id: user.id,
          name: user.name ?? "Unknown",
          email: user.email,
          image: user.image ?? null,
          balance: balanceMap[user.id] ?? 0,
        });
      }
    }
  }

  return Array.from(userMap.values());
}

export async function getGroups(userId: string) {
  if (!userId) return [];

  return prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: userId, // explicit
        },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
      expenses: {
        include: {
          splits: true,
        },
      },
    },
  });
}

export const formatEmail = (email?: string) => {
  if (!email) return "";

  const [name, domain] = email.split("@");

  if (!name || !domain) return email;

  const shortName = name.length > 6 ? name.slice(0, 5) + "…" : name;

  return `${shortName}@${domain}`;
};
