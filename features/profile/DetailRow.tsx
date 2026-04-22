import { DetailRowProps } from "@/types";

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg border border-white/10">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-medium text-white">{value || "—"}</span>
    </div>
  );
}
