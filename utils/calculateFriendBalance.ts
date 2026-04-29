import { GroupWithRelations, ISettlement } from "@/types";

export function calculateFriendBalances(
  groups: GroupWithRelations[],
  currentUserId: string,
  settlements: ISettlement[] = [],
) {
  const balanceMap: Record<string, number> = {};

  // =========================
  // 🧾 EXPENSES
  // =========================
  for (const group of groups) {
    for (const expense of group.expenses) {
      const paidBy = expense.paidById;

      // 🔥 SAFE PARTICIPANTS (fallback for old data)
      const participantIds = new Set(
        (expense?.participants ?? []).map((p) => p.userId),
      );

      const hasParticipants = participantIds.size > 0;

      for (const split of expense.splits) {
        // 🚫 If participants exist → enforce filter
        if (hasParticipants && !participantIds.has(split.userId)) continue;

        const userId = split.userId;
        const amount = split.amount;

        // Skip self
        if (userId === paidBy) continue;

        // Init balances
        if (balanceMap[userId] === undefined) balanceMap[userId] = 0;
        if (balanceMap[paidBy] === undefined) balanceMap[paidBy] = 0;

        // 🔥 Core logic
        if (paidBy === currentUserId) {
          balanceMap[userId] += amount;
        } else if (userId === currentUserId) {
          balanceMap[paidBy] -= amount;
        }
      }
    }
  }

  // =========================
  // 💰 SETTLEMENTS
  // =========================
  for (const s of settlements) {
    if (balanceMap[s.toUserId] === undefined) balanceMap[s.toUserId] = 0;

    if (balanceMap[s.fromUserId] === undefined) balanceMap[s.fromUserId] = 0;

    if (s.fromUserId === currentUserId) {
      balanceMap[s.toUserId] -= s.amount;
    }

    if (s.toUserId === currentUserId) {
      balanceMap[s.fromUserId] += s.amount;
    }
  }

  return balanceMap;
}
