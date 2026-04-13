"use client";

import { useRouter } from "next/navigation";
import { mutate } from "swr";

export const useGroupActions = (
  groupId: string,
  setToast: (t: any) => void,
) => {
  const router = useRouter();

  const key = `/api/groups/${groupId}`;

  // =========================
  // DELETE GROUP
  // =========================
  const deleteGroup = async () => {
    try {
      // 🔥 optimistic remove (optional if list page uses SWR)
      mutate(
        (k: string) => typeof k === "string" && k.startsWith("/api/groups"),
        undefined,
        false,
      );

      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      // ✅ revalidate all groups
      mutate(
        (k: string) => typeof k === "string" && k.startsWith("/api/groups"),
      );

      setToast({
        message: "Group deleted successfully",
        type: "success",
        id: Date.now(),
      });

      router.push("/groups");
    } catch (err) {
      console.error(err);

      setToast({
        message: "Failed to delete group ❌",
        type: "error",
        id: Date.now(),
      });
    }
  };

  // =========================
  // EXIT GROUP
  // =========================
  const exitGroup = async (userId: string) => {
    try {
      // 🔥 optimistic remove (optional)
      mutate(
        key,
        (prev: any) => ({
          ...prev,
          members: prev.members.filter((m: any) => m.user.id !== userId),
        }),
        false,
      );

      const res = await fetch(`/api/groups/${groupId}/exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error();

      mutate(
        (k: string) => typeof k === "string" && k.startsWith("/api/groups"),
      );

      setToast({
        message: "You left the group",
        type: "info",
        id: Date.now(),
      });

      router.push("/groups");
    } catch (err) {
      console.error(err);

      mutate(key); // rollback

      setToast({
        message: "Failed to exit group ❌",
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
