"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { calculateBalances } from "@/lib/balance";
import { simplifyDebts } from "@/lib/settle";
import AddExpenseModal from "@/components/expenses/add-expense-modal";

export default function GroupDetailPage() {
    const { id } = useParams();

    const [group, setGroup] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // 🔥 Invite state
    const [email, setEmail] = useState("");

    const fetchGroup = async () => {
        const res = await fetch(`/api/groups/${id}`);
        const data = await res.json();
        setGroup(data);
    };

    useEffect(() => {
        fetchGroup();
    }, []);

    // ======================
    // 🔥 INVITE FUNCTION
    // ======================
    const inviteUser = async () => {
        const res = await fetch("/api/groups/invite", {
            method: "POST",
            body: JSON.stringify({
                email,
                groupId: id,
            }),
        });

        const data = await res.json();

        if (data.success) {
            alert("Invite sent (check console for link)");
            setEmail("");
        } else {
            alert(data.error || "Something went wrong");
        }
    };

    if (!group) return <p className="p-4">Loading...</p>;

    // ======================
    // BALANCE LOGIC
    // ======================
    const balances = calculateBalances(group.expenses || []);
    const transactions = simplifyDebts(balances);

    return (
        <div className="max-w-md mx-auto p-4 pb-24">
            {/* HEADER */}
            <h1 className="text-xl font-bold">{group.name}</h1>

            {/* MEMBERS */}
            <div className="flex -space-x-2 mt-3">
                {group.members.map((m: any) => (
                    <div
                        key={m.user.id}
                        className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs border"
                    >
                        {m.user.name?.[0] || m.user.email[0]}
                    </div>
                ))}
            </div>

            {/* ========================= */}
            {/* 🔥 INVITE UI HERE */}
            {/* ========================= */}
            <div className="flex gap-2 mt-4">
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Invite via email"
                    className="border p-2 flex-1 rounded-lg"
                />

                <button
                    onClick={inviteUser}
                    className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600"
                >
                    Invite
                </button>
            </div>

            {/* ===================== */}
            {/* EXPENSE HISTORY */}
            {/* ===================== */}
            <h2 className="mt-6 font-semibold">Expenses</h2>

            <div className="space-y-2 mt-2">
                {group.expenses.length === 0 ? (
                    <p className="text-sm text-gray-500">No expenses yet</p>
                ) : (
                    group.expenses.map((e: any) => (
                        <div key={e.id} className="p-3 border rounded">
                            <p className="font-medium">{e.description}</p>
                            <p className="text-sm">₹{e.amount}</p>
                            <p className="text-xs text-gray-500">
                                Paid by: {e.paidBy?.name || e.paidBy?.email}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* ===================== */}
            {/* BALANCES */}
            {/* ===================== */}
            <h2 className="mt-6 font-semibold">Balances</h2>

            <div className="space-y-1 mt-2">
                {Object.entries(balances).map(([userId, amount]: any) => {
                    const user = group.members.find(
                        (m: any) => m.user.id === userId
                    )?.user;

                    return (
                        <p key={userId} className="text-sm">
                            {amount > 0
                                ? `${user.name || user.email} is owed ₹${amount.toFixed(0)}`
                                : amount < 0
                                    ? `${user.name || user.email} owes ₹${Math.abs(
                                        amount
                                    ).toFixed(0)}`
                                    : `${user.name || user.email} is settled`}
                        </p>
                    );
                })}
            </div>

            {/* ===================== */}
            {/* SETTLE UI */}
            {/* ===================== */}
            <h2 className="mt-6 font-semibold">Settle Up</h2>

            <div className="space-y-1 mt-2">
                {transactions.length === 0 ? (
                    <p className="text-sm text-green-600">All settled 🎉</p>
                ) : (
                    transactions.map((t: any, i: number) => {
                        const fromUser = group.members.find(
                            (m: any) => m.user.id === t.from
                        )?.user;

                        const toUser = group.members.find(
                            (m: any) => m.user.id === t.to
                        )?.user;

                        return (
                            <p key={i} className="text-sm">
                                {fromUser.name || fromUser.email} pays{" "}
                                {toUser.name || toUser.email} ₹
                                {t.amount.toFixed(0)}
                            </p>
                        );
                    })
                )}
            </div>

            {/* ===================== */}
            {/* FLOAT BUTTON */}
            {/* ===================== */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-20 right-6 bg-green-500 text-white w-14 h-14 rounded-full text-2xl shadow-lg"
            >
                +
            </button>

            {/* ===================== */}
            {/* MODAL */}
            {/* ===================== */}
            {showModal && (
                <AddExpenseModal
                    group={group}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchGroup}
                />
            )}
        </div>
    );
}