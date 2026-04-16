"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { mutate } from "swr";

import { useGroupDetail } from "@/features/groups/hooks/useGroupDetail";
import { useGroupUI } from "@/features/groups/hooks/useGroupUI";
import { useGroupActions } from "@/features/groups/hooks/useGroupActions";
import { useGroupPage } from "@/features/groups/hooks/useGroupPage";

import GroupHeader from "@/features/groups/components/GroupHeader";
import GroupMenu from "@/features/groups/components/GroupMenu";
import ExpenseList from "@/features/expenses/components/ExpenseList";
import BalanceList from "@/features/balances/components/BalanceList";
import ExpenseFormModal from "@/features/expenses/components/ExpenseFormModal";
import AddExpenseButton from "@/features/expenses/components/AddExpenseButton";

import ShareModal from "@/components/modals/ShareModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import MembersModal from "@/components/modals/MembersModal";

import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";
import Toast, { ToastType } from "@/components/ui/Toast";
import Button from "@/components/ui/form/Button";

// =========================
// TYPES
// =========================
interface IUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface IGroupMember {
  user: IUser;
}

interface IExpense {
  id: string;
  amount: number;
  paidById: string;
}

interface IGroup {
  id: string;
  name: string;
  members: IGroupMember[];
  expenses: IExpense[];
}

// =========================
// COMPONENT
// =========================
export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const groupId = params?.id;

  // =========================
  // DATA
  // =========================
  const { group, loading } = useGroupDetail(groupId);
  const { toast, setToast } = useGroupUI();

  const { deleteGroup, exitGroup } = useGroupActions(groupId, setToast);

  // =========================
  // STATE
  // =========================
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);

  const [groupName, setGroupName] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [exitingGroup, setExitingGroup] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // =========================
  // MEMO
  // =========================
  const members = useMemo<IGroupMember[]>(() => group?.members ?? [], [group]);

  const currentUserId = useMemo<string | undefined>(() => {
    return members.find((m) => m.user.email === session?.user?.email)?.user.id;
  }, [members, session?.user?.email]);

  const getUserName = useCallback(
    (id: string) => {
      const name = members.find((m) => m.user.id === id)?.user.name;
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : "User";
    },
    [members],
  );

  // =========================
  // GROUP LOGIC
  // =========================
  const {
    editingExpense,
    setEditingExpense,
    setDeleteId,
    deleting,
    handleDeleteExpense,
    updateExpense,
    createExpense,
  } = useGroupPage(groupId, members, setShowDeleteConfirm, setToast);

  // =========================
  // HANDLERS
  // =========================
  const handleEdit = useCallback((expense: IExpense) => {
    setEditingExpense(expense);
    setShowModal(true);
  }, []);

  const handleExpenseSave = useCallback(
    async (data: Partial<IExpense>) => {
      if (saving) return;

      try {
        setSaving(true);

        const success = editingExpense
          ? await updateExpense(data)
          : await createExpense(data);

        if (success) setShowModal(false);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    },
    [editingExpense, updateExpense, createExpense, saving],
  );

  const handleDeleteGroup = useCallback(async () => {
    try {
      setDeletingGroup(true);
      await deleteGroup();
      router.replace("/groups");
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingGroup(false);
    }
  }, [deleteGroup, router]);

  const handleExitGroup = useCallback(async () => {
    if (!currentUserId) {
      setToast({
        message: "User not found ❌",
        type: "error",
        id: Date.now(),
      });
      return;
    }

    try {
      setExitingGroup(true);
      await exitGroup(currentUserId);
      router.push("/groups");
    } finally {
      setExitingGroup(false);
    }
  }, [exitGroup, currentUserId, router, setToast]);

  const handleUpdateGroup = useCallback(async () => {
    if (!groupName.trim()) return;

    try {
      setUpdatingGroup(true);

      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error();

      await mutate(
        `/api/groups/${groupId}`,
        (prev: IGroup | undefined) =>
          prev ? { ...prev, name: groupName } : prev,
        false,
      );

      setShowEditGroup(false);
    } finally {
      setUpdatingGroup(false);
    }
  }, [groupId, groupName]);

  // =========================
  // UI GUARD
  // =========================
  if (loading) return <GroupDetailSkeleton />;
  if (!group) return <div className="p-6">Group not found</div>;

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col overflow-hidden bg-zinc-950 text-white">
      {/* HEADER */}
      <GroupHeader
        groupName={group.name}
        onMenuClick={() => setShowMenu((p) => !p)}
        groupMembers={members}
        buttonRef={buttonRef}
      />

      {/* MENU */}
      <GroupMenu
        show={showMenu}
        onClose={() => setShowMenu(false)}
        anchorRef={buttonRef}
        onEditGroup={() => {
          setShowMenu(false);
          setGroupName(group.name);
          setShowEditGroup(true);
        }}
        onShare={() => setShowShare(true)}
        onMembers={() => setShowMembers(true)}
        onExit={() => setShowExit(true)}
        onDelete={() => setShowDelete(true)}
      />

      {/* CONTENT */}
      {group.expenses?.length > 0 ? (
        <>
          <h2 className="my-2 font-semibold text-lg">Balances</h2>

          <BalanceList
            members={members}
            expenses={group.expenses}
            currentUserId={currentUserId}
            getName={getUserName}
          />

          <h2 className="my-2 font-semibold text-lg">Expenses</h2>

          <div className="flex-1 overflow-y-auto no-scrollbar mb-28">
            <ExpenseList
              expenses={group.expenses}
              members={members}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={(id) => {
                setDeleteId(id);
                setShowDeleteConfirm(true);
              }}
              loading={false}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            💸
          </div>
          <h3 className="text-lg font-semibold mt-4">No expenses yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Tap + to add your first expense
          </p>
        </div>
      )}

      {/* ADD BUTTON */}
      <AddExpenseButton
        onClick={() => {
          setEditingExpense(null);
          setShowModal(true);
        }}
      />

      {/* MODALS */}
      <ExpenseFormModal
        show={showModal}
        onClose={() => !saving && setShowModal(false)}
        members={members}
        loading={saving}
        editingExpense={editingExpense}
        currentUserId={currentUserId}
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
        members={members}
        currentUserId={currentUserId}
      />

      {/* CONFIRMATIONS */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete expense?"
        description="This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        loading={deleting}
        type="danger"
        onConfirm={handleDeleteExpense}
        onClose={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        show={showDelete}
        title="Delete group?"
        description="This cannot be undone."
        confirmText={deletingGroup ? "Deleting..." : "Delete"}
        loading={deletingGroup}
        type="danger"
        onConfirm={handleDeleteGroup}
        onClose={() => setShowDelete(false)}
      />

      <ConfirmModal
        show={showExit}
        title="Exit group?"
        description="You will lose access."
        confirmText={exitingGroup ? "Exiting..." : "Exit"}
        loading={exitingGroup}
        onConfirm={handleExitGroup}
        onClose={() => setShowExit(false)}
      />

      {/* EDIT GROUP */}
      {showEditGroup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEditGroup(false)}
          />
          <div className="relative bg-white p-6 rounded-2xl w-[90%] max-w-md">
            <input
              name="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border p-3 rounded-xl text-black"
            />

            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditGroup(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                loading={updatingGroup}
                disabled={updatingGroup}
                onClick={handleUpdateGroup}
              >
                {updatingGroup ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <Toast key={toast.id} {...toast} />}
    </div>
  );
}
