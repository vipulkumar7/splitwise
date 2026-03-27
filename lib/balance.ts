export function calculateBalances(expenses: any[]) {
  const balances: Record<string, number> = {};

  expenses.forEach((expense) => {
    const payer = expense.paidById;

    // payer gets full amount
    balances[payer] = (balances[payer] || 0) + expense.amount;

    // subtract splits
    expense.splits.forEach((split: any) => {
      balances[split.userId] =
        (balances[split.userId] || 0) - split.amount;
    });
  });

  return balances;
}