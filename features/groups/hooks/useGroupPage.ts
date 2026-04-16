"use client";

import { IExpense, IExpenseFormData, IToast, ToastType } from "@/types";
import { useState, useCallback } from "react";
import { mutate } from "swr";

export const useGroupPage = (
  groupId: string,
  _members: unknown[], // kept for compatibility (not used)
  setShowDeleteConfirm: (v: boolean) => void,
  setToast: (t: IToast) => void,
) => {
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const key = `/api/groups/${groupId}`;

  // =========================
  // COMMON HELPERS
  // =========================
  const showToast = (message: string, type: ToastType) => {
    setToast({
      message,
      type,
      id: Date.now(),
    });
  };
  const handleError = async (res: Response) => {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Something went wrong");
  };

  // =========================
  // DELETE EXPENSE
  // =========================
  const handleDeleteExpense = useCallback(async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/expenses/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) await handleError(res);

      await mutate(key);

      showToast("Expense deleted", "success");
    } catch (err: unknown) {
      console.error(err);

      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  }, [deleteId, key, setShowDeleteConfirm]);

  const updateExpense = useCallback(
    async (data: IExpenseFormData): Promise<boolean> => {
      if (!editingExpense) return false;

      try {
        const res = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.description,
            amount: Number(data.amount),
            payerId: data.payerId,
          }),
        });

        if (!res.ok) await handleError(res);

        await mutate(key);

        showToast("Expense updated", "success");
        return true;
      } catch (err: unknown) {
        console.error(err);

        showToast(
          err instanceof Error ? err.message : "Update failed",
          "error",
        );

        return false;
      }
    },
    [editingExpense, key],
  );

  const createExpense = useCallback(
    async (data: IExpenseFormData): Promise<boolean> => {
      try {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.description,
            amount: Number(data.amount || 0),
            payerId: data.payerId,
            groupId,
          }),
        });

        if (!res.ok) await handleError(res);

        await mutate(key);

        showToast("Expense added 🎉", "success");
        return true;
      } catch (err: unknown) {
        console.error(err);

        showToast(
          err instanceof Error ? err.message : "Expense failed",
          "error",
        );

        return false;
      }
    },
    [groupId, key],
  );

  return {
    // state
    editingExpense,
    setEditingExpense,
    setDeleteId,

    // loading
    deleting,

    // actions
    handleDeleteExpense,
    updateExpense,
    createExpense,
  };
};
