// components/dashboard/ExpenseSummary.tsx

export default function ExpenseSummary({ expenses }: any) {
  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  const topSpender = Object.values(
    expenses.reduce((acc: any, e: any) => {
      const name = e.paidBy?.name || e.paidBy?.email;
      acc[name] = (acc[name] || 0) + e.amount;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b - a)[0];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 border rounded">
        <p className="text-sm text-gray-500">Total Expense</p>
        <p className="text-xl font-bold">₹{total}</p>
      </div>

      <div className="p-4 border rounded">
        <p className="text-sm text-gray-500">Top Spender</p>
        <p className="text-xl font-bold">₹{topSpender || 0 as any}</p>
      </div>
    </div>
  );
}