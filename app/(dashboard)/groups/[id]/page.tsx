"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGroupDetail } from "@/hooks/useGroupDetail";
import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";
import Toast from "@/components/ui/toast";
import GroupHeader from "@/components/groups/GroupHeader";
import GroupMenu from "@/components/groups/GroupMenu";
import ExpenseList from "@/components/groups/ExpenseList";
import BalanceList from "@/components/groups/BalanceList";
import AddExpenseModal from "@/components/groups/AddExpenseModal";
import ShareModal from "@/components/groups/ShareModal";
import ConfirmModal from "@/components/groups/ConfirmModal";
import AddExpenseButton from "@/components/groups/AddExpenseButton";
import MembersModal from "@/components/groups/MembersModal";

export default function GroupDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const groupId = params.id as string;

    const {
        group,
        loading,
        refreshing,
        toast,
        setToast,
        addExpense,
        addingExpense,
        setAddingExpense,
        deleteGroup,
        exitGroup,
        deleteExpense,
        fetchGroup
    } = useGroupDetail(groupId);

    // =========================
    // UI STATES
    // =========================
    const [showMenu, setShowMenu] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showExit, setShowExit] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [payerId, setPayerId] = useState("");
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showEditGroup, setShowEditGroup] = useState(false);
    const [groupName, setGroupName] = useState(group?.name || "");
    const [updatingGroup, setUpdatingGroup] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState(false);
    const [exitingGroup, setExitingGroup] = useState(false);
    // =========================
    // LOADING
    // =========================
    if (loading) return <GroupDetailSkeleton />;
    if (!group) return <div className="p-6">Group not found</div>;

    const members = group.members || [];

    const currentUserId = members.find(
        (m: any) => m.user.email === session?.user?.email
    )?.user.id;

    const handleEdit = (expense: any) => {
        setEditingExpense(expense);

        setDescription(expense.description);
        setAmount(String(expense.amount));

        // 🔥 FORCE STRING
        setPayerId(String(expense.paidById));

        setShowModal(true);
    };

    const handleDeleteExpense = async () => {
        if (!deleteId) return;

        setDeleting(true);

        try {
            await deleteExpense(deleteId); // ✅ already correct
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const getName = (id: string) =>
        members.find((m: any) => m.user.id === id)?.user.name || "User";

    const resetForm = () => {
        setEditingExpense(null);
        setDescription("");
        setAmount("");
        setPayerId("");
    };

    const handleDelete = async () => {
        try {
            setDeletingGroup(true);
            await deleteGroup();
            router.push("/groups");
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingGroup(false);
        }
    };

    const handleExit = async () => {
        try {
            setExitingGroup(true);
            await exitGroup(currentUserId);
            router.push("/groups");
        } catch (err) {
            console.error(err);
        } finally {
            setExitingGroup(false);
        }
    };

    if (loading) return <GroupDetailSkeleton />;

    // =========================
    // UI
    // =========================
    return (
        <div className="max-w-md mx-auto p-4 pb-24 relative">

            {/* HEADER */}
            <GroupHeader
                groupName={group.name}
                onMenuClick={() => setShowMenu(!showMenu)}
                groupMembers={group.members || []}
            />

            {/* MENU */}
            <GroupMenu
                show={showMenu}
                onClose={() => setShowMenu(false)}
                onEditGroup={() => {
                    setShowMenu(false);
                    setGroupName(group.name);
                    setShowEditGroup(true);
                }}
                onShare={() => {
                    setShowMenu(false);
                    setShowShare(true);
                }}
                onMembers={() => {
                    setShowMenu(false);
                    setShowMembers(true);
                }}
                onExit={() => {
                    setShowMenu(false);
                    setShowExit(true);
                }}
                onDelete={() => {
                    setShowMenu(false);
                    setShowDelete(true);
                }}
            />

            {/* EXPENSES */}
            {group?.expenses?.length > 0 ? (
                <>
                    <h2 className="mt-6 font-semibold text-lg">Expenses</h2>

                    <ExpenseList
                        expenses={group.expenses}
                        members={group.members}
                        currentUserId={session?.user?.id}
                        onEdit={handleEdit}
                        onDelete={(id) => {
                            setDeleteId(id);
                            setShowDeleteConfirm(true);
                        }}
                        loading={refreshing}
                    />

                    {/* BALANCES */}
                    <h2 className="mt-6 font-semibold text-lg">Balances</h2>

                    <BalanceList
                        members={members}
                        expenses={group.expenses || []}
                        currentUserId={currentUserId}
                        getName={getName}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">

                    {/* ICON */}
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-3xl">💸</span>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-lg font-semibold text-gray-700">
                        No expenses yet
                    </h3>

                    {/* SUBTEXT */}
                    <p className="text-sm text-gray-400 mt-1 max-w-xs">
                        Tap the + button below to add your first expense
                    </p>

                </div>
            )}

            {/* FLOAT BUTTON */}
            {/* <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-20 right-6 w-14 h-14 bg-green-500 text-white text-3xl rounded-full flex items-center justify-center shadow-lg"
            >
                +
            </button> */}
            <AddExpenseButton
                onClick={() => {
                    setEditingExpense(null); // reset edit mode
                    setDescription("");
                    setAmount("");

                    // ✅ SET DEFAULT PAYER = CURRENT USER
                    setPayerId(session?.user?.id || "");

                    setShowModal(true);
                }}
            />

            {/* ========================= */}
            {/* MODALS */}
            {/* ========================= */}

            <AddExpenseModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                members={group.members || []}
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                payerId={payerId}
                setPayerId={setPayerId}
                loading={addingExpense}
                editingExpense={editingExpense}
                onAdd={async () => {
                    if (!description || !amount || !payerId) {
                        alert("All fields required");
                        return;
                    }

                    try {
                        setAddingExpense(true);
                        if (editingExpense) {
                            // ✅ UPDATE EXPENSE (FIXED PATH)
                            const res = await fetch(
                                `/api/expenses/${editingExpense.id}`,
                                {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        description,
                                        amount,
                                        payerId,
                                    }),
                                }
                            );

                            if (!res.ok) throw new Error("Update failed");
                            setToast({ message: "Expense updated successfully", type: "success" });
                            await fetchGroup(true); // refresh data

                        } else {
                            // ✅ ADD EXPENSE (NO CHANGE)
                            await addExpense({
                                description,
                                amount,
                                payerId,
                            });
                        }

                    } catch (err) {
                        console.error(err);
                    } finally {
                        // RESET
                        setAddingExpense(false);
                        resetForm();
                        setShowModal(false);
                    }
                }}
            />

            <ShareModal
                show={showShare}
                onClose={() => setShowShare(false)}
                groupId={groupId}
                groupName={group.name}
                setToast={setToast}
            />

            <MembersModal
                show={showMembers}
                onClose={() => setShowMembers(false)}
                members={group.members || []}
                currentUserId={currentUserId || ""}
            />


            <ConfirmModal
                show={showExit}
                title="Exit this group?"
                description="You will lose access to all group expenses."
                confirmText={exitingGroup ? "Exiting..." : "Exit"}
                loading={exitingGroup}
                onConfirm={handleExit}
                onClose={() => !exitingGroup && setShowExit(false)}
            />

            <ConfirmModal
                show={showDelete}
                title="Delete this group?"
                description="This action cannot be undone. All expenses will be lost."
                confirmText={deletingGroup ? "Deleting..." : "Delete"}
                type="danger"
                loading={deletingGroup}
                onConfirm={handleDelete}
                onClose={() => !deletingGroup && setShowDelete(false)} // 🔒 block close
            />

            <ConfirmModal
                show={showDeleteConfirm}
                title="Delete expense?"
                description="This action cannot be undone."
                confirmText={deleting ? "Deleting..." : "Delete"}
                type="danger"
                onConfirm={handleDeleteExpense}
                onClose={() => setShowDeleteConfirm(false)}
            />

            {showEditGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowEditGroup(false)}
                    />

                    {/* MODAL */}
                    <div className="relative w-[90%] max-w-md rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20 p-6 animate-in fade-in zoom-in-95 duration-200">

                        {/* TITLE */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Edit Group Name
                        </h2>

                        {/* INPUT */}
                        <div className="mb-5">
                            <input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                autoFocus
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3">

                            {/* CANCEL */}
                            <button
                                onClick={() => setShowEditGroup(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition active:scale-[0.97]"
                            >
                                Cancel
                            </button>

                            {/* UPDATE */}
                            <button
                                disabled={updatingGroup}
                                onClick={async () => {
                                    if (!groupName.trim()) return;

                                    try {
                                        setUpdatingGroup(true); // 🔥 START LOADING

                                        const res = await fetch(`/api/groups/${groupId}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name: groupName }),
                                        });

                                        if (!res.ok) throw new Error("Update failed");

                                        await fetchGroup(true); // refresh UI
                                        setShowEditGroup(false);

                                    } catch (err) {
                                        console.error(err);
                                    } finally {
                                        setUpdatingGroup(false); // 🔥 STOP LOADING
                                    }
                                }}
                                className={`flex-1 py-3 rounded-xl text-white font-semibold transition ${updatingGroup
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 active:scale-[0.97]"
                                    }`}
                            >
                                {updatingGroup ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                    </div>
                                ) : (
                                    "Update"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type as "success" | "error"} />}
        </div>
    );
}