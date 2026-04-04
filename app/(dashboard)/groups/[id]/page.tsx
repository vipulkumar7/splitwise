"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarGroup from "@/components/ui/AvatarGroup";
import Toast from "@/components/ui/toast";
import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";
import { FaWhatsapp, FaCopy, FaEnvelope, } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function GroupDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    const [inviting, setInviting] = useState(false);
    const [addingExpense, setAddingExpense] = useState(false);

    const [email, setEmail] = useState("");
    const [toast, setToast] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerId, setPayerId] = useState("");
    const [showMenu, setShowMenu] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showAction, setShowAction] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);

    const [showEmailInput, setShowEmailInput] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [expenseLoading, setExpenseLoading] = useState(false);
    const [latestExpenseId, setLatestExpenseId] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [groupName, setGroupName] = useState(group?.name || "");
    const [editName, setEditName] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    // =========================
    // SAFE FETCH
    // =========================
    const safeFetchGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}`);

            if (res.status === 404) {
                setToast("Group was deleted ❌");
                setTimeout(() => {
                    window.location.href = "/groups";
                }, 1500);
                return null;
            }

            return res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        const init = async () => {
            setLoading(true); // ✅ START

            const data = await safeFetchGroup();
            if (data) setGroup(data);

            setLoading(false); // ✅ END
        };

        init();
    }, [groupId]);

    // =========================
    // TAB FOCUS REFRESH
    // =========================
    useEffect(() => {
        const handleFocus = async () => {
            setLoading(true);
            const data = await safeFetchGroup();
            if (data) setGroup(data);
            setLoading(false);
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [groupId]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        if (currentUserId) setPayerId(currentUserId);
    }, [currentUserId]);

    const getName = (id: string) =>
        members.find((m: any) => m.user.id === id)?.user.name || "User";

    const addExpense = async () => {
        if (!amount || !description || addingExpense) return;

        try {
            setAddingExpense(true);
            setBalanceLoading(true);
            setExpenseLoading(true);

            const res = await fetch("/api/expenses", {
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

            if (res.status === 404) {
                safeFetchGroup();
                return;
            }

            setShowModal(false);
            setAmount("");
            setDescription("");

            const data = await safeFetchGroup();
            if (data) setGroup(data);

            setToast("Expense added ✅");
            if (data?.expenses?.length) {
                const latest = data.expenses[data.expenses.length - 1];
                setLatestExpenseId(latest.id);
                setTimeout(() => setLatestExpenseId(null), 2000);
            }
        } catch {
            setToast("Failed ❌");
        } finally {
            setAddingExpense(false);
            setBalanceLoading(false);
            setExpenseLoading(false);
            setTimeout(() => setToast(""), 3000);
        }
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
        try {
            const res = await fetch(`/api/groups/${groupId}`, {
                method: "DELETE",
            });

            if (res.status === 404) {
                setToast("Group already deleted ❌");
                setTimeout(() => {
                    window.location.href = "/groups";
                }, 1500);
                return;
            }

            const data = await res.json();

            if (data.success) {
                setToast("Group deleted successfully 🗑️"); // ✅ toast

                setTimeout(() => {
                    window.location.href = "/groups"; // ✅ delayed redirect
                }, 1500);
            } else {
                setToast("Delete failed ❌");
            }

            setTimeout(() => setToast(""), 3000);
        } catch (error) {
            console.error(error);
            setToast("Something went wrong ❌");
            setTimeout(() => setToast(""), 3000);
        }
    };

    const handleExitGroup = async () => {
        if (!currentUserId) return;

        try {
            const res = await fetch(`/api/groups/remove-member`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, groupId }),
            });

            if (res.status === 404) {
                setToast("Group no longer exists ❌");

                setTimeout(() => {
                    window.location.href = "/groups";
                }, 1500);

                return;
            }

            const data = await res.json();

            if (data.success) {
                setShowExitConfirm(false);

                setToast("Exited group successfully 🚪"); // ✅ toast

                setTimeout(() => {
                    window.location.href = "/groups"; // ✅ delay redirect
                }, 1500);
            } else {
                setToast("Failed to exit group ❌");
            }

            setTimeout(() => setToast(""), 3000);

        } catch (error) {
            console.error(error);
            setToast("Something went wrong ❌");
            setTimeout(() => setToast(""), 3000);
        }
    };

    const getInviteLink = async () => {
        const res = await fetch("/api/groups/invite-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ groupId }),
        });

        const data = await res.json();

        if (!data.success) throw new Error("Failed");

        return data.inviteLink;
    };

    const handleCopy = async () => {
        try {
            setShareLoading(true);
            const link = await getInviteLink();

            await navigator.clipboard.writeText(link);
            setToast("Link copied 🔗");
            setShowShareModal(false);
        } catch {
            setToast("Failed ❌");
        } finally {
            setShareLoading(false);
            setTimeout(() => setToast(""), 3000);
        }
    };

    const handleWhatsApp = async () => {
        try {
            const link = await getInviteLink();

            const message = `Join my group "${group.name}" 💸\n${link}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");

            setShowShareModal(false);
        } catch {
            setToast("Failed ❌");
        }
    };

    const handleEmailInvite = async () => {
        if (!inviteEmail || emailLoading) return;

        try {
            setEmailLoading(true);

            const res = await fetch("/api/groups/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    groupId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setToast(`Invite sent to ${inviteEmail} ✅`);
                setInviteEmail("");
                setShowEmailInput(false);
                setShowShareModal(false);
            } else {
                setToast("Failed ❌");
            }
        } catch {
            setToast("Error ❌");
        } finally {
            setEmailLoading(false);
            setTimeout(() => setToast(""), 3000);
        }
    };

    const groupExpensesByDate = (expenses: any[]) => {
        const groups: Record<string, any[]> = {};

        expenses.forEach((exp) => {
            const date = new Date(exp.createdAt);
            const today = new Date();

            let label = date.toLocaleDateString();

            if (date.toDateString() === today.toDateString()) {
                label = "Today";
            } else {
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);

                if (date.toDateString() === yesterday.toDateString()) {
                    label = "Yesterday";
                }
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(exp);
        });

        return groups;
    };

    const sortedExpenses = [...(group?.expenses ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groupedExpenses = groupExpensesByDate(sortedExpenses);

    const updateGroupName = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: editName }),
            });

            if (!res.ok) throw new Error();

            setToast("Group name updated ✅");
            setShowEditModal(false);
            setShowEdit(false);
            router.refresh();
        } catch {
            setToast("Failed to update group");
        }
    };

    // =========================
    // BALANCES
    // =========================
    const balances: Record<string, number> = {};

    members.forEach((m: any) => {
        balances[m.user.id] = 0;
    });

    sortedExpenses?.forEach((exp: any) => {
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
    // ✅ LOADING SKELETON
    // =========================
    if (loading) {
        return (
            <div className="max-w-md mx-auto p-4">
                <GroupDetailSkeleton />
            </div>
        );
    }

    if (!group) {
        return <div className="p-6 text-center">Group not found</div>;
    }

    // =========================
    // UI (UNCHANGED)
    // =========================
    return (
        <div className="max-w-md mx-auto p-4 pb-24 relative">

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>

                <button onClick={() => setShowMenu(!showMenu)}>
                    <BsThreeDotsVertical />
                </button>

                {showMenu && (
                    <div
                        ref={menuRef} // ✅ ADD THIS
                        className="absolute right-4 top-12 bg-white shadow rounded w-48 z-50"
                    >
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                setShowMenu(false);
                                setEditName(group?.name || "");
                                setShowEdit(true);
                                setShowEditModal(true);
                            }}>
                            Edit Group Name
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                setShowMenu(false);
                                setShowMembersModal(true);
                            }}>
                            Members
                        </button>
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                setShowShareModal(true);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                            Share Invite
                        </button>

                        <button
                            onClick={() => {
                                setShowMenu(false);
                                setShowExitConfirm(true);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                            Exit Group
                        </button>

                        <button
                            onClick={() => {
                                setShowMenu(false);
                                setShowDeleteConfirm(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        >
                            Delete Group
                        </button>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 mt-3">
                <AvatarGroup members={members} />
                {/* MEMBER COUNT */}
                <p className="text-sm text-gray-500">
                    {members.length} members
                </p>
            </div>
            {/* EXPENSES */}
            <h2 className="mt-6 font-semibold">Expenses</h2>

            <div className="mt-3 space-y-6">
                {Object.entries(groupedExpenses).map(([date, expenses]: any) => (
                    <div key={date}>
                        {/* DATE HEADER */}
                        <p className="text-xs text-gray-500 mb-2 font-semibold">
                            {date}
                        </p>

                        <div className="space-y-2">
                            {expenses.map((exp: any) => {
                                const isNew = exp.id === latestExpenseId;

                                return (
                                    <div
                                        key={exp.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isNew
                                            ? "bg-green-50 border-green-400 shadow-sm"
                                            : "bg-white"
                                            }`}
                                    >
                                        {/* LEFT */}
                                        <div className="flex items-center gap-3">
                                            {/* <div className="text-xl">
                                                {exp.description}
                                            </div> */}

                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {exp.description}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Paid by {getName(exp.paidById)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* RIGHT */}
                                        <p className="text-sm font-semibold text-gray-900">
                                            ₹{exp.amount}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>


            {/* BALANCES */}
            <h2 className="mt-6 font-semibold text-lg">Balances</h2>

            <div className="mt-3 space-y-3">
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
                                    {/* AVATAR */}
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                                        {getName(userId)[0]}
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

            {/* FLOAT BUTTON */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-12 right-6 w-14 h-14 bg-green-500 text-white rounded-full text-2xl"
            >
                +
            </button>

            {/* Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
                    onClick={() => setShowModal(false)}>
                    {/* MODAL CARD */}
                    <div className="bg-white w-[340px] rounded-2xl shadow-2xl p-5 space-y-4 animate-scaleIn" onClick={(e) => e.stopPropagation()}>

                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                Add Expense
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="text-sm text-gray-500">Description</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Food, Travel"
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* AMOUNT */}
                        <div>
                            <label className="text-sm text-gray-500">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="₹0"
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* PAYER */}
                        <div>
                            <label className="text-sm text-gray-500">Paid by</label>
                            <select
                                value={payerId}
                                onChange={(e) => setPayerId(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {sortedMembers.map((m: any) => (
                                    <option key={m.user.id} value={m.user.id}>
                                        {m.user.id === currentUserId
                                            ? `${m.user.name} (You)`
                                            : m.user.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => setShowModal(false)}>Cancel</button>
                                <button
                                    onClick={addExpense}
                                    disabled={addingExpense}
                                    className={`px-4 py-1 rounded text-white ${addingExpense
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600"
                                        }`}
                                >
                                    {addingExpense ? "Adding..." : "Add"}
                                </button>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        {/* <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={isEditing ? updateExpense : addExpense}
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-medium transition active:scale-95"
                            >
                                {isEditing ? "Update" : "Add"}
                            </button>
                        </div> */}
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
            )
            }

            {/* CONFIRM */}
            {
                showConfirm && (
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
                )
            }

            {/* DELETE CONFIRM MODAL */}
            {
                showDeleteConfirm && (
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
                )
            }

            {showExitConfirm && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-[320px] text-center space-y-4 shadow-lg">

                        <h2 className="text-lg font-semibold text-red-600">
                            Exit Group?
                        </h2>

                        <p className="text-sm text-gray-500">
                            You will be removed from this group.
                        </p>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="px-4 py-1 rounded border"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleExitGroup} // ✅ NEW FUNCTION
                                className="bg-red-500 text-white px-4 py-1 rounded"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white w-[320px] rounded-2xl p-5 shadow-xl space-y-4">

                        {/* TITLE */}
                        <h2 className="text-lg font-semibold text-center">
                            Share Invite
                        </h2>

                        {/* OPTIONS */}
                        <div className="space-y-3">

                            {/* WHATSAPP */}
                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center justify-center gap-3 w-full border rounded-xl py-3 hover:bg-gray-50 transition"
                            >
                                <span className="text-green-500 text-xl">
                                    {/* react-icons */}
                                    <FaWhatsapp />
                                </span>
                                <span className="font-medium">WhatsApp</span>
                            </button>

                            {/* COPY */}
                            <button
                                onClick={handleCopy}
                                disabled={shareLoading}
                                className="flex items-center justify-center gap-3 w-full border rounded-xl py-3 hover:bg-gray-50 transition"
                            >
                                <span className="text-gray-700 text-lg">
                                    <FaCopy />
                                </span>
                                <span className="font-medium">Copy Link</span>
                            </button>

                            {/* EMAIL OPTION */}
                            {!showEmailInput ? (
                                <button
                                    onClick={() => setShowEmailInput(true)}
                                    className="flex items-center justify-center gap-3 w-full border rounded-xl py-3 hover:bg-gray-50 transition"
                                >
                                    <span className="text-blue-500 text-lg">
                                        <FaEnvelope />
                                    </span>
                                    <span className="font-medium">Email</span>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full border p-2 rounded"
                                    />

                                    <button
                                        onClick={handleEmailInvite}
                                        disabled={emailLoading}
                                        className={`w-full text-white p-2 rounded ${emailLoading
                                            ? "bg-gray-400"
                                            : "bg-blue-500 hover:bg-blue-600"
                                            }`}
                                    >
                                        {emailLoading ? "Inviting..." : "Send Invite"}
                                    </button>
                                </div>
                            )}

                            {/* CANCEL */}
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full text-center text-gray-500 mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-[320px] rounded-2xl p-5 shadow-xl"
                    >
                        <h2 className="font-semibold text-lg mb-3">Edit Group Name</h2>

                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>

                            <button
                                onClick={updateGroupName}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMembersModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setShowMembersModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-[340px] rounded-2xl p-5 shadow-xl"
                    >
                        <h2 className="font-semibold text-lg mb-4">Group Members</h2>

                        <div className="space-y-3">
                            {members.map((m: any) => (
                                <div
                                    key={m.user.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                                        {m.user.name[0]}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <p className="font-medium">
                                            {m.user.id === currentUserId
                                                ? "You"
                                                : m.user.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {m.user.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowMembersModal(false)}
                            className="mt-4 w-full bg-gray-100 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast} />}
        </div>
    );
}