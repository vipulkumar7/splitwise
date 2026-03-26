export default function ExpenseHistory({ expenses }: any) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Expenses</h2>

      {expenses.map((e: any) => (
        <div key={e.id} className="border p-2 rounded mb-2">
          <p className="font-medium">{e.description}</p>
          <p>₹{e.amount}</p>
          <p className="text-sm text-gray-500">
            Paid by: {e.paidBy?.name || e.paidBy?.email}
          </p>
        </div>
      ))}
    </div>
  );
}