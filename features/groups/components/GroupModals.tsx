"use client";

import dynamic from "next/dynamic";
import { IGroup, IGroupModalsProps } from "@/types";
import { useState } from "react";
import { useSWRConfig } from "swr";

const ExpenseFormModal = dynamic(
  () => import("@/features/expenses/components/ExpenseFormModal"),
);
const ShareModal = dynamic(() => import("@/components/modals/ShareModal"));
const MembersModal = dynamic(() => import("@/components/modals/MembersModal"));
const ConfirmModal = dynamic(() => import("@/components/modals/ConfirmModal"));

export default function GroupModals({
  ui,
  setUI,
  group,
  members,
  currentUserId,
  editingExpense,
  handleDeleteExpense,
  deleting,
  handleSave,
  deleteGroup,
  exitGroup,
  setToast,
  saving,
  deletingGroup,
  exitingGroup,
}: IGroupModalsProps) {
  const { mutate } = useSWRConfig();
  const [groupName, setGroupName] = useState(group.name);
  const [updating, setUpdating] = useState(false);

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error();

      await mutate<IGroup>(
        `/api/groups/${group.id}`,
        (prev) =>
          prev
            ? {
                ...prev,
                name: groupName,
              }
            : prev,
        false,
      );

      setUI((p) => ({ ...p, showEditGroup: false }));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {ui.showModal && (
        <ExpenseFormModal
          show
          onClose={() => setUI((p) => ({ ...p, showModal: false }))}
          members={members}
          currentUserId={currentUserId}
          editingExpense={editingExpense}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {ui.showShare && (
        <ShareModal
          show
          onClose={() => setUI((p) => ({ ...p, showShare: false }))}
          groupId={group.id}
          groupName={group.name}
          setToast={setToast}
        />
      )}

      {ui.showMembers && (
        <MembersModal
          show
          onClose={() => setUI((p) => ({ ...p, showMembers: false }))}
          members={members}
          currentUserId={currentUserId}
        />
      )}

      {ui.showDeleteConfirm && (
        <ConfirmModal
          show
          type="danger"
          title="Delete expense?"
          description="This action cannot be undone."
          confirmText={deleting ? "Deleting..." : "Delete"}
          onConfirm={handleDeleteExpense}
          loading={deleting}
          onClose={() => setUI((p) => ({ ...p, showDeleteConfirm: false }))}
        />
      )}

      {ui.showDelete && (
        <ConfirmModal
          show
          type="danger"
          title="Delete group?"
          description="This cannot be undone."
          confirmText={deletingGroup ? "Deleting..." : "Delete"}
          loading={deletingGroup}
          onConfirm={deleteGroup}
          onClose={() => setUI((p) => ({ ...p, showDelete: false }))}
        />
      )}

      {ui.showExit && (
        <ConfirmModal
          show
          type="danger"
          title="Exit group?"
          description="You will lose access."
          confirmText={exitingGroup ? "Exiting..." : "Exit"}
          loading={exitingGroup}
          onConfirm={exitGroup}
          onClose={() => setUI((p) => ({ ...p, showExit: false }))}
        />
      )}

      {ui.showEditGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setUI((p) => ({ ...p, showEditGroup: false }))}
          />

          <div className="relative w-[90%] max-w-md rounded-3xl bg-zinc-950 p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Edit Group Name
            </h2>

            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 text-black rounded-xl"
            />

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 py-3 border rounded-xl text-white"
                onClick={() => setUI((p) => ({ ...p, showEditGroup: false }))}
              >
                Cancel
              </button>

              <button
                className="flex-1 py-3 bg-green-500 rounded-xl text-white"
                disabled={updating}
                onClick={handleUpdateGroup}
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
