export default function Balances({ balances }: any) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Balances</h2>

      {Object.values(balances).map((b: any) => (
        <p key={b.name}>
          {b.amount > 0
            ? `${b.name} is owed ₹${b.amount}`
            : b.amount < 0
            ? `${b.name} owes ₹${Math.abs(b.amount)}`
            : `${b.name} is settled`}
        </p>
      ))}
    </div>
  );
}