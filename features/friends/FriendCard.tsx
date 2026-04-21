"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";

interface IFriend {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export default function FriendCard({ friend }: { friend: IFriend }) {
  const router = useRouter();
  const isOwe = friend.balance < 0;
  const isOwed = friend.balance > 0;

  const label = isOwe ? "You owe" : isOwed ? "Gets back" : "Settled up";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition"
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* AVATAR */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
            isOwe ? "bg-red-500" : isOwed ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {friend.name.charAt(0).toUpperCase()}
        </div>

        {/* INFO */}
        <div>
          <p className="font-medium">{friend.name}</p>
          {/* <p className="font-medium">{friend.email}</p> */}

          <p
            className={`text-sm ${
              isOwe
                ? "text-red-400"
                : isOwed
                  ? "text-green-400"
                  : "text-gray-400"
            }`}
          >
            {label}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <p
          className={`font-semibold ${
            isOwe ? "text-red-400" : isOwed ? "text-green-400" : "text-gray-400"
          }`}
        >
          ₹{Math.abs(friend.balance).toFixed(2)}
        </p>

        {isOwe ? (
          <FiArrowUpRight className="text-red-400" />
        ) : isOwed ? (
          <FiArrowDownLeft className="text-green-400" />
        ) : null}

        {/* SETTLE BUTTON */}
        {friend.balance !== 0 && (
          <button
          disabled
            className="text-xs bg-green-500 px-3 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition"
            onClick={() => router.push(`/settle/${friend.id}`)}
          >
            Settle
          </button>
        )}
      </div>
    </motion.div>
  );
}
