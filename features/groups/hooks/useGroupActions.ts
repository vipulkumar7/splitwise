"use client";

import { IGroup, IToast } from "@/types";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

export const useGroupActions = (
  groupId: string,
  setToast: (t: IToast) => void,
) => {
  const router = useRouter();
  const key = `/api/groups/${groupId}`;

  // =========================
  // COMMON REVALIDATE
  // =========================
  const revalidateGroups = () =>
    mutate((k: string) => k.startsWith("/api/groups"));

  const deleteGroup = async () => {
    try {
      // 🔥 optimistic clear (list will refresh)
      revalidateGroups();

      const res = await fetch(key, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }

      revalidateGroups();

      setToast({
        message: "Group deleted successfully",
        type: "success",
        id: Date.now(),
      });

      router.push("/groups");
    } catch (err: unknown) {
      console.error(err);

      setToast({
        message:
          err instanceof Error ? err.message : "Failed to delete group ❌",
        type: "error",
        id: Date.now(),
      });
    }
  };

  const exitGroup = async (userId: string) => {
    try {
      // 🔥 optimistic update (safe)
      mutate<IGroup>(
        key,
        (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            members: prev.members.filter((m) => m.user.id !== userId),
          };
        },
        false,
      );

      const res = await fetch(`${key}/exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to exit group");
      }

      revalidateGroups();

      setToast({
        message: "You left the group",
        type: "info",
        id: Date.now(),
      });

      router.push("/groups");
    } catch (err: unknown) {
      console.error(err);

      // ❌ rollback
      mutate(key);

      setToast({
        message: err instanceof Error ? err.message : "Failed to exit group ❌",
        type: "error",
        id: Date.now(),
      });
    }
  };

  return {
    deleteGroup,
    exitGroup,
  };
};
