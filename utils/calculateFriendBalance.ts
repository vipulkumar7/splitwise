import { IGroup } from "@/types";

export function calculateFriendBalances(
  groups: IGroup[],
  currentUserId?: string | undefined,
) {
  const balanceMap = new Map<string, number>();

  if (!currentUserId) return balanceMap;

  groups.forEach((group) => {
    group.expenses?.forEach((expense) => {
      const paidBy = expense.paidById;
      if (!paidBy) return;

      expense.splits?.forEach((split) => {
        const userId = split.userId;
        const amount = split.amount;

        // 👉 YOU owe someone
        if (userId === currentUserId && paidBy !== currentUserId) {
          balanceMap.set(
            paidBy,
            (balanceMap.get(paidBy) ?? 0) - amount,
          );
        }

        // 👉 others owe YOU
        else if (paidBy === currentUserId && userId !== currentUserId) {
          balanceMap.set(
            userId,
            (balanceMap.get(userId) ?? 0) + amount,
          );
        }
      });
    });
  });

  return balanceMap;
}