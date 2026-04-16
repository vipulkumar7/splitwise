"use client";

import { IBalanceList } from "@/types";
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

    // init
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

  // =========================
  // SORT
  // =========================
  const sortedBalances = useMemo(
    () => Object.entries(balances).sort(([, a], [, b]) => b - a),
    [balances],
  );

  // =========================
  // UI
  // =========================
  return (
    <div className="mt-4 space-y-3">
      {sortedBalances.map(([userId, amount]) => {
        const safeAmount = Number.isFinite(amount) ? amount : 0;

        const isPositive = safeAmount > 0;
        const isNegative = safeAmount < 0;
        const isYou = userId === currentUserId;

        const name = isYou ? "You" : getName(userId);

        const status = isPositive
          ? "gets back"
          : isNegative
            ? "owes"
            : "settled";

        const amountColor = isPositive
          ? "text-green-600"
          : isNegative
            ? "text-red-500"
            : "text-gray-500";

        const bgColor = isPositive
          ? "bg-green-50"
          : isNegative
            ? "bg-red-50"
            : "bg-gray-50";

        return (
          <div
            key={userId}
            className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${bgColor}`}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-black">
                {name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div>
                <p className="font-medium text-white">{name}</p>

                <p className={`text-sm ${amountColor}`}>{status}</p>
              </div>
            </div>

            {/* RIGHT */}
            <p className={`text-lg font-semibold ${amountColor}`}>
              ₹{Math.abs(safeAmount).toFixed(0)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
