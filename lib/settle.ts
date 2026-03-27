export function simplifyDebts(balances: Record<string, number>) {
  const creditors: any[] = [];
  const debtors: any[] = [];

  Object.entries(balances).forEach(([userId, amount]) => {
    if (amount > 0) creditors.push({ userId, amount });
    if (amount < 0) debtors.push({ userId, amount });
  });

  const transactions: any[] = [];

  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(
      Math.abs(debtor.amount),
      creditor.amount
    );

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settleAmount,
    });

    debtor.amount += settleAmount;
    creditor.amount -= settleAmount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}