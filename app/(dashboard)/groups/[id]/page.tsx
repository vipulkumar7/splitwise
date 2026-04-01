"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarGroup from "@/components/ui/AvatarGroup";
import Toast from "@/components/ui/toast";

export default function GroupDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [toast, setToast] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerId, setPayerId] = useState("");

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showAction, setShowAction] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // =========================
    // FETCH GROUP
    // =========================
    useEffect(() => {
        const fetchGroup = async () => {
            const res = await fetch(`/api/groups/${groupId}`);
            const data = await res.json();
            setGroup(data);
        };

        fetchGroup();
    }, [groupId]);

    // =========================
    // SAFE DATA
    // =========================
    const members = group?.members || [];

    const currentUserId = members.find(
        (m: any) => m.user.email === session?.user?.email
    )?.user.id;

    const sortedMembers = [...members].sort((a: any, b: any) => {
        if (a.user.id === currentUserId) return -1;
        if (b.user.id === currentUserId) return 1;
        return 0;
    });

    useEffect(() => {
        if (currentUserId) {
            setPayerId(currentUserId);
        }
    }, [currentUserId]);

    // =========================
    // ACTIONS
    // =========================
    const inviteUser = async () => {
        if (!email) return;

        const res = await fetch("/api/groups/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, groupId }),
        });

        const data = await res.json();

        setToast(data.success ? `Invite sent to ${email}` : "Failed ❌");
        setEmail("");
        setTimeout(() => setToast(""), 3000);
    };

    const addExpense = async () => {
        if (!amount || !description) return;

        await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

        const res = await fetch(`/api/groups/${groupId}`);
        setGroup(await res.json());
    };

    const removeMember = async (userId: string) => {
        await fetch("/api/groups/remove-member", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, groupId }),
        });

        const res = await fetch(`/api/groups/${groupId}`);
        setGroup(await res.json());
    };

    const deleteGroup = async () => {
        const res = await fetch(`/api/groups/${groupId}`, {
            method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
            window.location.href = "/groups";
        } else {
            setToast("Delete failed ❌");
        }
    };

    // =========================
    // BALANCE
    // =========================
    const balances: Record<string, number> = {};

    members.forEach((m: any) => {
        balances[m.user.id] = 0;
    });

    group?.expenses?.forEach((exp: any) => {
        const splitAmount = exp.amount / members.length;

        members.forEach((m: any) => {
            if (m.user.id === exp.paidById) {
                balances[m.user.id] += exp.amount - splitAmount;
            } else {
                balances[m.user.id] -= splitAmount;
            }
        });
    });

    const getName = (id: string) =>
        members.find((m: any) => m.user.id === id)?.user.name || "User";

    // =========================
    // LOADING
    // =========================
    if (!group) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4 pb-24">
            {/* HEADER */}
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">{group.name}</h1>

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                >
                    Delete Group
                </button>
            </div>

            <AvatarGroup members={members} />

            {/* MEMBERS */}
            <h2 className="mt-4 font-semibold">Members</h2>

            {members.map((m: any) => (
                <div key={m.user.id} className="flex justify-between p-3 border rounded mt-2">
                    <span>{m.user.name || m.user.email}</span>

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

            {/* INVITE */}
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

            {/* EXPENSES */}
            <h2 className="mt-6 font-semibold">Expenses</h2>

            <div className="space-y-3 mt-2">
                {group.expenses?.map((exp: any) => (
                    <div key={exp.id} className="p-3 border rounded">
                        <p>{exp.description}</p>
                        <p>₹{exp.amount}</p>
                        <p className="text-sm text-gray-500">
                            Paid by: {getName(exp.paidById)}
                        </p>
                    </div>
                ))}
            </div>

            {/* BALANCES */}
            <h2 className="mt-6 font-semibold">Balances</h2>

            {Object.entries(balances).map(([userId, amount]) => (
                <div key={userId}>
                    {amount > 0 ? (
                        <p className="text-green-600">
                            {getName(userId)} is owed ₹{amount.toFixed(0)}
                        </p>
                    ) : amount < 0 ? (
                        <p className="text-red-500">
                            {getName(userId)} owes ₹{Math.abs(amount).toFixed(0)}
                        </p>
                    ) : (
                        <p>{getName(userId)} is settled</p>
                    )}
                </div>
            ))}

            {/* FLOAT BUTTON */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-12 right-6 w-14 h-14 bg-green-500 text-white rounded-full text-2xl"
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
                            {sortedMembers.map((m: any) => (
                                <option key={m.user.id} value={m.user.id}>
                                    {m.user.id === currentUserId
                                        ? `${m.user.name} (You)`
                                        : m.user.name}
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

            {/* CONFIRM */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded text-center">
                        <p>Remove {selectedUser?.name}?</p>

                        <button
                            onClick={async () => {
                                await removeMember(selectedUser.id);
                                setShowConfirm(false);
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM MODAL */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-[320px] text-center space-y-4 shadow-lg">

                        <h2 className="text-lg font-semibold text-red-600">
                            Delete Group?
                        </h2>

                        <p className="text-sm text-gray-500">
                            This will permanently delete the group and all expenses.
                        </p>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-1 rounded border"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    await deleteGroup();
                                    setShowDeleteConfirm(false);
                                }}
                                className="bg-red-500 text-white px-4 py-1 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast} />}
        </div>
    );
}