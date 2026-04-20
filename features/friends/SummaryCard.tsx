interface Props {
  label: string;
  value: number;
  type: "owe" | "owed" | "net";
}

export default function SummaryCard({ label, value, type }: Props) {
  const color =
    type === "owe"
      ? "text-red-400"
      : type === "owed"
        ? "text-green-400"
        : "text-white";

  return (
    <div
      className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md hover:border-white/20 transition flex flex-col justify-between"
      style={{ margin: "16px 0" }}
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${color}`}>₹{value}</p>
    </div>
  );
}
