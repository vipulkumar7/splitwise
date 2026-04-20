import { prisma } from "@/lib/db/prisma";
import { IGroup } from "@/types";

export function buildFriendsFromBalances(
  groups: IGroup[],
  balanceMap: Map<string, number>,
  currentUserId?: string | undefined,
) {
  const userMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      balance: number;
    }
  >();

  groups.forEach((group) => {
    group.members.forEach((member) => {
      const user = member.user;

      if (!user || user.id === currentUserId) return;

      if (!userMap.has(user.id as any)) {
        userMap.set(user.id as any, {
          id: user.id as any,
          name: user.name ?? "Unknown",
          email: user.email as any,
          image: user.image,
          balance: balanceMap.get(user.id as any) ?? 0, // ✅ key fix
        });
      } else {
        const existing = userMap.get(user.id as any)!;
        existing.balance += balanceMap.get(user.id as any) ?? 0;
      }
    });
  });

  return Array.from(userMap.values());
}

export async function getGroups(userId: string | undefined) {
  return prisma.group.findMany({
    where: {
      members: {
        some: { userId },
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
