export default function ExpenseHistory({ expenses }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="font-semibold mb-3">Expenses</h2>

      {expenses.map((e: any) => (
        <div
          key={e.id}
          className="flex justify-between items-center py-2 border-b last:border-none"
        >
          <div>
            <p className="font-medium">{e.description}</p>
            <p className="text-xs text-gray-500">
              Paid by {e.paidBy?.email}
            </p>
          </div>

          <span className="font-semibold">₹{e.amount}</span>
        </div>
      ))}
    </div>
  );
}