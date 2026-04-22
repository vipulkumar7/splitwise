import { ISummaryCardProps } from "@/types";
import { motion } from "framer-motion";

export default function SummaryCard({ label, value, type }: ISummaryCardProps) {
  const config = {
    owe: {
      text: "text-red-400",
      bg: "from-red-500/10 to-transparent",
      glow: "shadow-red-500/10",
    },
    owed: {
      text: "text-green-400",
      bg: "from-green-500/10 to-transparent",
      glow: "shadow-green-500/10",
    },
    net: {
      text: "text-white",
      bg: "from-white/10 to-transparent",
      glow: "shadow-white/10",
    },
  };

  const { text, bg, glow } = config[type];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className={`relative rounded-2xl p-4 backdrop-blur-xl border border-white/10 
      bg-gradient-to-br ${bg} ${glow} transition-all duration-300`}
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition bg-white/5" />

      <p className="text-xs text-white z-10 relative">{label}</p>

      <p className={`text-xl font-semibold mt-2 ${text} z-10 relative`}>
        ₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
    </motion.div>
  );
}
