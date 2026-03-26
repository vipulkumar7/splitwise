export function calculateBalances(expenses: any[]) {
  const balances: Record<string, any> = {};

  expenses.forEach((exp) => {
    // everyone owes
    exp.splits.forEach((split: any) => {
      const user = split.user;

      if (!balances[user.id]) {
        balances[user.id] = {
          name: user.name,
          amount: 0,
        };
      }

      balances[user.id].amount -= split.amount;
    });

    // payer gets money
    const payer = exp.paidBy;

    if (!balances[payer.id]) {
      balances[payer.id] = {
        name: payer.name,
        amount: 0,
      };
    }

    balances[payer.id].amount += exp.amount;
  });

  return balances;
}