export default function Balances({ balances }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="font-semibold mb-3">Balances</h2>

      {Object.values(balances).map((b: any) => (
        <div key={b.name} className="flex justify-between py-1">
          <span>{b.name}</span>

          <span
            className={
              b.amount > 0
                ? "text-green-600"
                : b.amount < 0
                  ? "text-red-500"
                  : "text-gray-400"
            }
          >
            {b.amount > 0
              ? `+₹${b.amount}`
              : b.amount < 0
                ? `-₹${Math.abs(b.amount)}`
                : "0"}
          </span>
        </div>
      ))}
    </div>
  );
}