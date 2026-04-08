"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGroupDetail } from "@/features/groups/hooks/useGroupDetail";
import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";
import Toast from "@/components/ui/Toast";
import GroupMenu from "@/features/groups/components/GroupMenu";
import ExpenseList from "@/features/expenses/components/ExpenseList1";
import BalanceList from "@/features/balances/components/BalanceList";
import ExpenseFormModal from "@/features/expenses/components/ExpenseFormModal";
import ShareModal from "@/components/modals/ShareModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import AddExpenseButton from "@/features/expenses/components/AddExpenseButton";
import MembersModal from "@/components/modals/MembersModal";
import { useGroupUI } from "@/features/groups/hooks/useGroupUI";
import { useGroupActions } from "@/features/groups/hooks/useGroupActions";
import GroupHeader from "@/features/groups/components/GroupHeader";

export default function GroupDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const groupId = params.id as string;

  const { group, loading, refreshing, fetchGroup } = useGroupDetail(groupId);

  const { toast, setToast, addingExpense, setAddingExpense } = useGroupUI();

  const { addExpense, deleteGroup, exitGroup, deleteExpense } = useGroupActions(
    groupId,
    fetchGroup,
    setToast,
  );

  const buttonRef = useRef<HTMLButtonElement | null>(null);
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
    (m: any) => m.user.email === session?.user?.email,
  )?.user.id;

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPayerId(String(expense.paidById));
    setShowModal(true);
  };

  const handleDeleteExpense = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      await deleteExpense(deleteId);
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

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      setUpdatingGroup(true);

      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error("Update failed");

      // ✅ Close edit mode immediately (UX boost)
      setShowEditGroup(false);

      // ✅ Background refresh
      fetchGroup(true);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingGroup(false);
    }
  };

  const createExpense = async (data: any) => {
    await addExpense({
      description: data.description,
      amount: Number(data.amount),
      payerId: data.payerId,
    });

    setToast({
      message: "Expense added successfully",
      type: "success",
      id: Date.now(),
    });
  };

  const updateExpense = async (data: any) => {
    const res = await fetch(`/api/expenses/${editingExpense.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: data.description,
        amount: Number(data.amount),
        payerId: data.payerId,
      }),
    });

    if (!res.ok) throw new Error("Update failed");

    setToast({
      message: "Expense updated successfully",
      type: "success",
      id: Date.now(),
    });
  };

  const handleExpenseSave = async (data: any) => {
    try {
      setAddingExpense(true);

      if (editingExpense) {
        await updateExpense(data);
      } else {
        await createExpense(data);
      }

      // ✅ Close immediately
      setShowModal(false);

      // ✅ Background refresh
      fetchGroup(true);
    } catch (err) {
      console.error(err);

      setToast({
        message: "Something went wrong ❌",
        type: "error",
        id: Date.now(),
      });
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) return <GroupDetailSkeleton />;

  return (
    <div className="max-w-md mx-auto p-4 pb-24 relative h-screen flex flex-col">
      {/* HEADER */}
      <GroupHeader
        groupName={group.name}
        onMenuClick={() => setShowMenu(!showMenu)}
        groupMembers={group.members || []}
        buttonRef={buttonRef}
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
        anchorRef={buttonRef}
      />

      {/* EXPENSES */}
      {group?.expenses?.length > 0 ? (
        <>
          {/* BALANCES */}
          <h2 className="my-2 font-semibold text-lg">Balances</h2>

          <BalanceList
            members={members}
            expenses={group.expenses || []}
            currentUserId={currentUserId}
            getName={getName}
          />

          <h2 className="my-2 font-semibold text-lg">Expenses</h2>
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth mb-20">
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
          </div>
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

      <ExpenseFormModal
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
        onSave={handleExpenseSave}
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
        loading={deleting}
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
                onClick={handleUpdateGroup}
                className={`flex-1 py-3 rounded-xl text-white font-semibold transition ${
                  updatingGroup
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
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
    </div>
  );
}
