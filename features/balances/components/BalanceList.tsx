"use client";

import { useMemo } from "react";

export default function BalanceList({
  members = [],
  expenses = [],
  currentUserId,
  getName,
}: any) {
  // =========================
  // CALCULATE BALANCES (MEMOIZED)
  // =========================
  const balances = useMemo(() => {
    if (!members.length) return {};

    const result: Record<string, number> = {};

    // initialize
    members.forEach((m: any) => {
      result[m.user.id] = 0;
    });

    expenses.forEach((exp: any) => {
      const amount = Number(exp.amount || 0);

      // ✅ avoid division by 0
      const splitAmount = members.length ? amount / members.length : 0;

      members.forEach((m: any) => {
        if (m.user.id === exp.paidById) {
          result[m.user.id] += amount - splitAmount;
        } else {
          result[m.user.id] -= splitAmount;
        }
      });
    });

    return result;
  }, [members, expenses]);

  // =========================
  // SORTED ENTRIES (MEMOIZED)
  // =========================
  const sortedBalances = useMemo(() => {
    return Object.entries(balances).sort((a, b) => b[1] - a[1]);
  }, [balances]);

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

        return (
          <div
            key={userId}
            className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
              isPositive
                ? "bg-green-50"
                : isNegative
                  ? "bg-red-50"
                  : "bg-gray-50"
            }`}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                {getName(userId)?.[0] || "?"}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {isYou ? "You" : getName(userId)}
                </p>

                <p
                  className={`text-sm ${
                    isPositive
                      ? "text-green-600"
                      : isNegative
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {isPositive ? "gets back" : isNegative ? "owes" : "settled"}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <p
              className={`text-lg font-semibold ${
                isPositive
                  ? "text-green-600"
                  : isNegative
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              ₹{Math.abs(safeAmount).toFixed(0)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
