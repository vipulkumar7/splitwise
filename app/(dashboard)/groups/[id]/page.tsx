"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AvatarGroup from "@/components/ui/AvatarGroup";
import Toast from "@/components/ui/toast";

export default function GroupDetailPage() {
    const params = useParams();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [toast, setToast] = useState("");

    // Expense modal
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerId, setPayerId] = useState("");

    // Remove member UX
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showAction, setShowAction] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // =========================
    // FETCH GROUP
    // =========================
    const fetchGroup = async () => {
        const res = await fetch(`/api/groups/${groupId}`);
        const data = await res.json();
        setGroup(data);

        if (data?.members?.length) {
            setPayerId(data.members[0].user.id);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    // =========================
    // INVITE USER
    // =========================
    const inviteUser = async () => {
        if (!email) return;

        const res = await fetch("/api/groups/invite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, groupId }),
        });

        const data = await res.json();

        if (data.success) {
            setToast(`Invite sent to ${email} 📩`);
            setEmail("");
        } else {
            setToast("Failed ❌");
        }

        setTimeout(() => setToast(""), 3000);
    };

    // =========================
    // ADD EXPENSE
    // =========================
    const addExpense = async () => {
        if (!amount || !description) return;

        await fetch("/api/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: Number(amount),
                description,
                groupId,
                payerId,
                splitType: "equal",
            }),
        });

        setShowModal(false);
        setAmount("");
        setDescription("");
        fetchGroup();
    };

    // =========================
    // REMOVE MEMBER
    // =========================
    const removeMember = async (userId: string) => {
        await fetch("/api/groups/remove-member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, groupId }),
        });

        fetchGroup();
    };

    // =========================
    // DELETE GROUP
    // =========================
    const deleteGroup = async () => {
        if (!confirm("Delete group?")) return;

        await fetch(`/api/groups/${groupId}`, {
            method: "DELETE",
        });

        window.location.href = "/groups";
    };

    if (!group) return <div className="p-4">Loading...</div>;

    // =========================
    // BALANCE
    // =========================
    const balances: Record<string, number> = {};

    group.members.forEach((m: any) => {
        balances[m.user.id] = 0;
    });

    group.expenses.forEach((exp: any) => {
        const splitAmount = exp.amount / group.members.length;

        group.members.forEach((m: any) => {
            if (m.user.id === exp.paidById) {
                balances[m.user.id] += exp.amount - splitAmount;
            } else {
                balances[m.user.id] -= splitAmount;
            }
        });
    });

    const getName = (id: string) =>
        group.members.find((m: any) => m.user.id === id)?.user.name || "User";

    return (
        <div className="max-w-md mx-auto p-4 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{group.name}</h1>

                <button
                    onClick={deleteGroup}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                >
                    Delete Group
                </button>
            </div>

            {/* Avatars */}
            <div className="mt-4">
                <AvatarGroup members={group.members} />
            </div>

            {/* MEMBERS (MODERN UI) */}
            <h2 className="mt-4 font-semibold">Members</h2>

            <div className="space-y-2 mt-2">
                {group.members.map((m: any) => (
                    <div
                        key={m.user.id}
                        className="flex items-center justify-between p-3 border rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
                                {m.user.name?.[0] || m.user.email[0]}
                            </div>

                            <span>{m.user.name || m.user.email}</span>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedUser(m.user);
                                setShowAction(true);
                            }}
                        >
                            ⋮
                        </button>
                    </div>
                ))}
            </div>

            {/* Invite */}
            <div className="flex gap-2 mt-4">
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Invite via email"
                    className="border p-2 flex-1 rounded"
                />
                <button
                    onClick={inviteUser}
                    className="bg-blue-500 text-white px-4 rounded"
                >
                    Invite
                </button>
            </div>

            {/* Expenses */}
            <h2 className="mt-6 font-semibold">Expenses</h2>

            <div className="space-y-3 mt-2">
                {group.expenses.map((exp: any) => (
                    <div key={exp.id} className="p-3 border rounded">
                        <p>{exp.description}</p>
                        <p>₹{exp.amount}</p>
                        <p className="text-sm text-gray-500">
                            Paid by: {getName(exp.paidById)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full text-2xl"
            >
                +
            </button>

            {/* Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-2xl w-[300px] space-y-3">
                        <input
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 w-full"
                        />

                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="border p-2 w-full"
                        />

                        <select
                            value={payerId}
                            onChange={(e) => setPayerId(e.target.value)}
                            className="border p-2 w-full"
                        >
                            {group.members.map((m: any) => (
                                <option key={m.user.id} value={m.user.id}>
                                    {m.user.name || m.user.email}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-between">
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            <button
                                onClick={addExpense}
                                className="bg-green-500 text-white px-4 py-1 rounded"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION SHEET */}
            {showAction && (
                <div className="fixed inset-0 bg-black/40 flex justify-end items-end">
                    <div className="bg-white w-full p-4 rounded-t-2xl">
                        <button
                            onClick={() => {
                                setShowAction(false);
                                setShowConfirm(true);
                            }}
                            className="text-red-500 w-full py-2"
                        >
                            Remove from group
                        </button>

                        <button onClick={() => setShowAction(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-2xl w-[300px] text-center space-y-4">
                        <p className="font-semibold">
                            Remove {selectedUser?.name || "user"}?
                        </p>

                        <div className="flex justify-between">
                            <button onClick={() => setShowConfirm(false)}>Cancel</button>

                            <button
                                onClick={async () => {
                                    if (!selectedUser?.id) return;
                                    await removeMember(selectedUser.id);
                                    setShowConfirm(false);
                                }}
                                className="text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast} />}
        </div>
    );
}