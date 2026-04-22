"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { useState, useMemo } from "react";

interface IFriend {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export default function FriendCard({ friend }: { friend: IFriend }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 🔥 Derived state (optimized)
  const { isOwe, isOwed, label, color } = useMemo(() => {
    const isOwe = friend.balance < 0;
    const isOwed = friend.balance > 0;

    return {
      isOwe,
      isOwed,
      label: isOwe ? "You owe" : isOwed ? "You are owed" : "All settled",
      color: isOwe ? "red" : isOwed ? "green" : "gray",
    };
  }, [friend.balance]);

  const amount = Math.abs(friend.balance);

  const handleSettle = () => {
    setLoading(true);
    router.push(`/settle/${friend.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex items-center justify-between p-4 rounded-2xl 
      bg-gradient-to-br from-white/5 to-white/0 
      border border-white/10 backdrop-blur-xl 
      hover:border-white/20 transition-all duration-300 shadow-md"
    >
      {/* 🔥 Glow Layer */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition ${
          color === "red"
            ? "bg-red-500/5"
            : color === "green"
              ? "bg-green-500/5"
              : "bg-white/5"
        }`}
      />

      {/* LEFT */}
      <div className="flex items-center gap-4 z-10">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${
            color === "red"
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : color === "green"
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gray-600"
          }`}
        >
          {friend.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <p className="font-medium tracking-tight">{friend.name}</p>

          <p
            className={`text-xs ${
              color === "red"
                ? "text-red-400"
                : color === "green"
                  ? "text-green-400"
                  : "text-gray-400"
            }`}
          >
            {label}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 z-10">
        {/* Amount */}
        <div className="text-right leading-tight">
          <p
            className={`text-lg font-semibold ${
              color === "red"
                ? "text-red-400"
                : color === "green"
                  ? "text-green-400"
                  : "text-gray-400"
            }`}
          >
            ₹{amount.toFixed(2)}
          </p>

          <div className="flex justify-end">
            {isOwe ? (
              <FiArrowUpRight className="text-red-400 text-sm" />
            ) : isOwed ? (
              <FiArrowDownLeft className="text-green-400 text-sm" />
            ) : null}
          </div>
        </div>

        {/* CTA */}
        {friend.balance !== 0 && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            disabled={loading}
            onClick={handleSettle}
            className="px-4 py-2 text-xs font-semibold rounded-lg 
              bg-green-500 hover:bg-green-600 active:scale-95 transition-all duration-200 
              text-white shadow-md 
              hover:shadow-lg hover:from-green-600 hover:to-emerald-700 
              active:scale-95 transition-all duration-200 
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Opening..." : "Settle"}

            {/* Shine effect */}
            <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 hover:opacity-100 transition" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
