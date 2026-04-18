"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import { useGroupDetail } from "@/features/groups/hooks/useGroupDetail";
import { useGroupUI } from "@/features/groups/hooks/useGroupUI";
import { useGroupActions } from "@/features/groups/hooks/useGroupActions";
import { useGroupPage } from "@/features/groups/hooks/useGroupPage";

import GroupHeader from "@/features/groups/components/GroupHeader";
import GroupMenu from "@/features/groups/components/GroupMenu";
import ExpenseList from "@/features/expenses/components/ExpenseList";
import BalanceList from "@/features/balances/components/BalanceList";
import AddExpenseButton from "@/features/expenses/components/AddExpenseButton";

import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";
import Toast from "@/components/ui/Toast";

import {
  IExpense,
  IExpenseFormData,
  IGroupMember,
  IGroupUIState,
} from "@/types";

const GroupModals = dynamic(() => import("./GroupModals"), {
  ssr: false,
});

export default function GroupDetailClient({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const { group, loading } = useGroupDetail(groupId);
  const { toast, setToast } = useGroupUI();
  const { deleteGroup, exitGroup } = useGroupActions(groupId, setToast);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [ui, setUI] = useState<IGroupUIState>({
    showMenu: false,
    showModal: false,
    showShare: false,
    showMembers: false,
    showDelete: false,
    showExit: false,
    showDeleteConfirm: false,
    showEditGroup: false,
  });

  const [saving, setSaving] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [exitingGroup, setExitingGroup] = useState(false);

  const members: IGroupMember[] = group?.members ?? [];

  const currentUserId = members.find(
    (m) => m.user.email === session?.user?.email,
  )?.user.id;

  const {
    editingExpense,
    setEditingExpense,
    setDeleteId,
    deleting,
    handleDeleteExpense,
    updateExpense,
    createExpense,
  } = useGroupPage(
    groupId,
    members,
    (v) => setUI((p) => ({ ...p, showDeleteConfirm: v })),
    setToast,
  );

  const handleEdit = (expense: IExpense) => {
    setEditingExpense(expense);
    setUI((p) => ({ ...p, showModal: true }));
  };

  // ✅ saving logic restored
  const handleSave = async (data: Partial<IExpenseFormData>) => {
    if (saving) return;

    try {
      setSaving(true);

      const success = editingExpense
        ? await updateExpense(data as IExpenseFormData)
        : await createExpense(data as IExpenseFormData);

      if (success) {
        setUI((p) => ({ ...p, showModal: false }));
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ delete group logic restored
  const handleDeleteGroup = async () => {
    try {
      setDeletingGroup(true);
      await deleteGroup();
      router.replace("/groups");
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingGroup(false);
    }
  };

  // ✅ exit group logic restored
  const handleExitGroup = async () => {
    console.log("first");
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
  };

  if (loading) return <GroupDetailSkeleton />;
  if (!group) return <div className="p-6">Group not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col bg-zinc-950 text-white">
      <GroupHeader
        groupName={group.name}
        onMenuClick={() => setUI((p) => ({ ...p, showMenu: !p.showMenu }))}
        groupMembers={members}
        buttonRef={buttonRef}
      />

      <GroupMenu
        show={ui.showMenu}
        onClose={() => setUI((p) => ({ ...p, showMenu: false }))}
        anchorRef={buttonRef}
        onEditGroup={() =>
          setUI((p) => ({
            ...p,
            showMenu: false,
            showEditGroup: true,
          }))
        }
        onShare={() =>
          setUI((p) => ({ ...p, showMenu: false, showShare: true }))
        }
        onMembers={() =>
          setUI((p) => ({ ...p, showMenu: false, showMembers: true }))
        }
        onExit={() => setUI((p) => ({ ...p, showMenu: false, showExit: true }))}
        onDelete={() =>
          setUI((p) => ({ ...p, showMenu: false, showDelete: true }))
        }
      />

      {group.expenses?.length > 0 ? (
        <>
          <h2 className="my-2 font-semibold text-lg">Balances</h2>
          <BalanceList
            members={members}
            expenses={group.expenses}
            currentUserId={currentUserId as string}
            getName={(id) =>
              members.find((m) => m.user.id === id)?.user.name ?? "User"
            }
          />

          <h2 className="my-2 font-semibold text-lg">Expenses</h2>
          <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-32">
            <ExpenseList
              expenses={group.expenses}
              members={members}
              currentUserId={currentUserId as string}
              onEdit={handleEdit}
              onDelete={(id) => {
                setDeleteId(id);
                setUI((p) => ({ ...p, showDeleteConfirm: true }));
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

      <AddExpenseButton
        onClick={() => {
          setEditingExpense(null);
          setUI((p) => ({ ...p, showModal: true }));
        }}
      />

      {/* ✅ Lazy Modals */}
      {(ui.showModal ||
        ui.showEditGroup ||
        ui.showShare ||
        ui.showMembers ||
        ui.showDelete ||
        ui.showExit ||
        ui.showDeleteConfirm) && (
        <GroupModals
          ui={ui}
          setUI={setUI}
          group={group}
          members={members}
          currentUserId={currentUserId as string}
          editingExpense={editingExpense}
          handleDeleteExpense={handleDeleteExpense}
          deleting={deleting}
          handleSave={handleSave}
          deleteGroup={handleDeleteGroup}
          exitGroup={handleExitGroup}
          setToast={setToast}
          saving={saving}
          deletingGroup={deletingGroup}
          exitingGroup={exitingGroup}
        />
      )}

      {/* ✅ Toast fix */}
      {toast && <Toast key={toast.id} {...toast} duration={3000} />}
    </div>
  );
}
