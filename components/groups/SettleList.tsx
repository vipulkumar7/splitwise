export default function SettleList({ transactions }: any) {
  return (
    <div className="mt-4">
      <h2 className="font-semibold mb-2">Settle Up</h2>

      {transactions.length === 0 ? (
        <p>All settled 🎉</p>
      ) : (
        transactions.map((t: any, i: number) => (
          <p key={i}>
            {t.from} pays {t.to} ₹{t.amount}
          </p>
        ))
      )}
    </div>
  );
}