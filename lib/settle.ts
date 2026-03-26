export function simplifyDebts(balances: any) {
  const creditors: any[] = [];
  const debtors: any[] = [];

  Object.entries(balances).forEach(([id, data]: any) => {
    if (data.amount > 0) {
      creditors.push({ id, ...data });
    } else if (data.amount < 0) {
      debtors.push({ id, ...data });
    }
  });

  const transactions: any[] = [];

  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(
      Math.abs(debtor.amount),
      creditor.amount
    );

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount,
    });

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 1) i++;
    if (creditor.amount < 1) j++;
  }

  return transactions;
}