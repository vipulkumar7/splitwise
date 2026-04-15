"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
import Toast from "@/components/ui/Toast";
import { mutate } from "swr";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const groupId = params.id as string;

  // =========================
  // DATA
  // =========================
  const { group, loading } = useGroupDetail(groupId);
  const { toast, setToast } = useGroupUI();

  const { deleteGroup, exitGroup } = useGroupActions(groupId, setToast);

  // =========================
  // UI STATE
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
  // MEMOIZED DATA
  // =========================
  const members = useMemo(() => group?.members ?? [], [group]);

  const currentUserId = useMemo(() => {
    return members.find((m: any) => m.user.email === session?.user?.email)?.user
      ?.id;
  }, [members, session]);

  // =========================
  // GROUP PAGE LOGIC
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
  const handleEdit = useCallback(
    (expense: any) => {
      setEditingExpense(expense);
      setShowModal(true);
    },
    [setEditingExpense],
  );

  const handleExpenseSave = useCallback(
    async (data: any) => {
      try {
        setSaving(true);

        let success = false;

        if (editingExpense) {
          success = await updateExpense(data);
        } else {
          success = await createExpense(data);
        }

        if (success) {
          setShowModal(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    },
    [editingExpense, updateExpense, createExpense],
  );

  const handleDeleteGroup = useCallback(async () => {
    setDeletingGroup(true);
    router.replace("/groups");

    try {
      await deleteGroup();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingGroup(false);
    }
  }, [deleteGroup, router]);

  const handleExitGroup = useCallback(async () => {
    try {
      setExitingGroup(true);
      await exitGroup(currentUserId);
      router.push("/groups");
    } finally {
      setExitingGroup(false);
    }
  }, [exitGroup, currentUserId, router]);

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
        (prev: any) => (prev ? { ...prev, name: groupName } : prev),
        false,
      );
      setShowEditGroup(false);
    } finally {
      setUpdatingGroup(false);
    }
  }, [groupId, groupName]);

  // =========================
  // LOADING
  // =========================
  if (loading || !group) return <GroupDetailSkeleton />;
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
            getName={(id: string) => {
              const name = members.find((m: any) => m.user.id === id)?.user
                ?.name;
              if (!name) return "User";
              return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            }}
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

      {/* FLOAT BUTTON */}
      <AddExpenseButton
        onClick={() => {
          setEditingExpense(null);
          setShowModal(true);
        }}
      />

      {/* MODAL */}
      <ExpenseFormModal
        show={showModal}
        onClose={() => !saving && setShowModal(false)}
        members={members}
        loading={saving}
        editingExpense={editingExpense}
        currentUserId={currentUserId}
        onSave={handleExpenseSave}
      />

      {/* OTHER MODALS */}
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
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border p-3 rounded-xl text-zinc-700"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEditGroup(false)}
                className="flex-1 border rounded-xl py-2 text-black"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateGroup}
                className="flex-1 bg-green-500 text-white rounded-xl py-2"
              >
                {updatingGroup ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
    </div>
  );
}
