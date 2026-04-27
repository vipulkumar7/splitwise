"use client";

import { IBalanceList } from "@/types";
import { formatEmail } from "@/utils/utils";
import { useMemo } from "react";

export default function BalanceList({
  members,
  expenses,
  currentUserId,
  getName,
}: IBalanceList) {
  const balances = useMemo<Record<string, number>>(() => {
    if (!members.length) return {};

    const result: Record<string, number> = {};

    members.forEach((m) => {
      result[m.user.id as string] = 0;
    });

    expenses.forEach((exp) => {
      const amount = Number(exp.amount) || 0;
      const split = members.length ? amount / members.length : 0;

      members.forEach((m) => {
        const id = m.user.id;

        if (id === exp.paidById) {
          result[id] += amount - split;
        } else {
          result[id as string] -= split;
        }
      });
    });

    return result;
  }, [members, expenses]);

  const sortedBalances = useMemo(
    () => Object.entries(balances).sort(([, a], [, b]) => b - a),
    [balances],
  );

  return (
    <div className="relative w-full">
      {/* RIGHT FADE (scroll hint) */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 z-10" />

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 py-3 scroll-smooth">
        {sortedBalances.map(([userId, amount]) => {
          const safeAmount = Number.isFinite(amount) ? amount : 0;

          const isPositive = safeAmount > 0;
          const isNegative = safeAmount < 0;
          const isYou = userId === currentUserId;

          const name = isYou ? "You" : getName(userId);
          const email = members.find((m) => m.user.id === userId)?.user.email;

          const status = isPositive ? "gets" : isNegative ? "owes" : "settled";

          const amountColor = isPositive
            ? "text-green-400"
            : isNegative
              ? "text-red-400"
              : "text-gray-400";

          const bgGlow = isPositive
            ? "shadow-[0_0_30px_rgba(34,197,94,0.15)]"
            : isNegative
              ? "shadow-[0_0_30px_rgba(239,68,68,0.15)]"
              : "";

          return (
            <div
              key={userId}
              className={`
              min-w-[200px] flex-shrink-0
              p-4 rounded-2xl
              border border-white/10
              backdrop-blur-xl
              transition-all duration-300
              hover:scale-[1.03]
              ${bgGlow}
            `}
            >
              {/* USER */}
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white
                ${isYou ? "bg-green-500" : "bg-white/20"}`}
                >
                  {name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate flex items-center gap-1">
                    {name}
                    {isYou && (
                      <span className="text-[10px] px-2 py-[2px] text-green-400 rounded-full">
                        You
                      </span>
                    )}
                  </p>

                  {/* subtle id hint (optional but recommended) */}
                  {!isYou && (
                    <p className="text-[11px] text-gray-500 truncate">
                      {formatEmail(email as string)}
                    </p>
                  )}
                </div>
              </div>

              {/* STATUS */}
              <p className={`text-xs uppercase tracking-wide ${amountColor}`}>
                {status}
              </p>

              {/* AMOUNT */}
              <p
                className={`text-xl font-bold mt-1 tracking-tight ${amountColor}`}
              >
                ₹{Math.abs(safeAmount).toFixed(0)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
