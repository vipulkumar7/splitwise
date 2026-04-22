import { GroupWithRelations, IGroup, ISettlement } from "@/types";

export function calculateFriendBalances(
  groups: GroupWithRelations[],
  currentUserId: string,
  settlements: ISettlement[] = [],
) {
  const balanceMap: Record<string, number> = {};

  // 🧾 Expenses
  for (const group of groups) {
    for (const expense of group.expenses) {
      const paidBy = expense.paidById;

      for (const split of expense.splits) {
        const userId = split.userId;
        const amount = split.amount;

        if (userId === paidBy) continue;

        if (!balanceMap[userId]) balanceMap[userId] = 0;
        if (!balanceMap[paidBy]) balanceMap[paidBy] = 0;

        if (paidBy === currentUserId) {
          balanceMap[userId] += amount;
        } else if (userId === currentUserId) {
          balanceMap[paidBy] -= amount;
        }
      }
    }
  }

  // 💰 Settlements (IMPORTANT 🔥)
  for (const s of settlements) {
    if (!balanceMap[s.toUserId]) balanceMap[s.toUserId] = 0;
    if (!balanceMap[s.fromUserId]) balanceMap[s.fromUserId] = 0;

    if (s.fromUserId === currentUserId) {
      balanceMap[s.toUserId] -= s.amount;
    }

    if (s.toUserId === currentUserId) {
      balanceMap[s.fromUserId] += s.amount;
    }
  }

  return balanceMap;
}
