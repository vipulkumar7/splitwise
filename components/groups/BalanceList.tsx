"use client";

export default function BalanceList({
    members = [],
    expenses = [],
    currentUserId,
    getName,
}: any) {
    // =========================
    // CALCULATE BALANCES
    // =========================
    const balances: Record<string, number> = {};

    members.forEach((m: any) => {
        balances[m.user.id] = 0;
    });

    expenses.forEach((exp: any) => {
        const splitAmount = exp.amount / members.length;

        members.forEach((m: any) => {
            if (m.user.id === exp.paidById) {
                balances[m.user.id] += exp.amount - splitAmount;
            } else {
                balances[m.user.id] -= splitAmount;
            }
        });
    });

    // =========================
    // UI
    // =========================
    return (
        <div className="mt-4 space-y-3">
            {Object.entries(balances)
                .sort((a, b) => b[1] - a[1])
                .map(([userId, amount]) => {
                    const isPositive = amount > 0;
                    const isNegative = amount < 0;
                    const isYou = userId === currentUserId;

                    return (
                        <div
                            key={userId}
                            className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${isPositive
                                    ? "bg-green-50"
                                    : isNegative
                                        ? "bg-red-50"
                                        : "bg-gray-50"
                                }`}
                        >
                            {/* LEFT */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                                    {getName(userId)?.[0]}
                                </div>

                                <div>
                                    <p className="font-medium text-gray-800">
                                        {isYou ? "You" : getName(userId)}
                                    </p>

                                    <p
                                        className={`text-sm ${isPositive
                                                ? "text-green-600"
                                                : isNegative
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                            }`}
                                    >
                                        {isPositive
                                            ? "gets back"
                                            : isNegative
                                                ? "owes"
                                                : "settled"}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <p
                                className={`text-lg font-semibold ${isPositive
                                        ? "text-green-600"
                                        : isNegative
                                            ? "text-red-500"
                                            : "text-gray-500"
                                    }`}
                            >
                                ₹{Math.abs(amount).toFixed(0)}
                            </p>
                        </div>
                    );
                })}
        </div>
    );
}