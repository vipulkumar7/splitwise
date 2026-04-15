"use client";

import { useState, useCallback } from "react";
import { mutate } from "swr";

type ToastType = {
  message: string;
  type: "success" | "error" | "info";
  id: number;
};

export const useGroupPage = (
  groupId: string,
  members: any[],
  setShowDeleteConfirm: (v: boolean) => void,
  setToast: (t: ToastType) => void,
) => {
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const key = `/api/groups/${groupId}`;

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

      if (!res.ok) throw new Error();

      // ✅ fresh data from backend
      await mutate(key);

      setToast({
        message: "Expense deleted",
        type: "success",
        id: Date.now(),
      });
    } catch (err) {
      console.error(err);

      setToast({
        message: "Delete failed",
        type: "error",
        id: Date.now(),
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  }, [deleteId, key, setShowDeleteConfirm, setToast]);

  // =========================
  // UPDATE EXPENSE
  // =========================
  const updateExpense = useCallback(
    async (data: any) => {
      const amount = parseFloat(data.amount);
      if (!editingExpense) return false;

      try {
        const res = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: data.description,
            amount,
            payerId: data.payerId,
          }),
        });

        if (!res.ok) throw new Error();

        // ✅ sync UI with backend
        await mutate(key);

        setToast({
          message: "Expense updated",
          type: "success",
          id: Date.now(),
        });

        return true;
      } catch (err) {
        console.error(err);

        setToast({
          message: "Update failed",
          type: "error",
          id: Date.now(),
        });

        return false;
      }
    },
    [editingExpense, key, setToast],
  );

  // =========================
  // CREATE EXPENSE (NO TEMP)
  // =========================
  const createExpense = useCallback(
    async (data: any) => {
      try {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: data.description,
            amount: Number(data.amount || 0),
            payerId: data.payerId,
            groupId,
          }),
        });

        if (!res.ok) throw new Error();

        // ✅ always use backend as source of truth
        await mutate(key);

        setToast({
          message: "Expense added 🎉",
          type: "success",
          id: Date.now(),
        });

        return true;
      } catch (err) {
        console.error(err);

        setToast({
          message: "Expense failed",
          type: "error",
          id: Date.now(),
        });

        return false;
      }
    },
    [groupId, key, setToast],
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
