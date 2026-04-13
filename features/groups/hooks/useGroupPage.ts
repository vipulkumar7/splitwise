"use client";

import { useState } from "react";
import { mutate } from "swr";

export const useGroupPage = (
  groupId: string,
  setShowDeleteConfirm: (v: boolean) => void,
  setToast: (t: any) => void,
) => {
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const key = `/api/groups/${groupId}`;

  // =========================
  // DELETE
  // =========================
  const handleDeleteExpense = async () => {
    if (!deleteId) return;

    setDeleting(true);

    mutate(
      key,
      (prev: any) => ({
        ...prev,
        expenses: prev.expenses.filter((e: any) => e.id !== deleteId),
      }),
      false,
    );

    try {
      const res = await fetch(`/api/expenses/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      mutate(key);

      setToast({
        message: "Expense deleted",
        type: "success",
        id: Date.now(),
      });
    } catch {
      mutate(key);

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
  };

  // =========================
  // UPDATE
  // =========================
  const updateExpense = async (data: any) => {
    if (!editingExpense) return;

    const id = editingExpense.id;

    mutate(
      key,
      (prev: any) => ({
        ...prev,
        expenses: prev.expenses.map((e: any) =>
          e.id === id
            ? {
                ...e,
                description: data.description,
                amount: Number(data.amount),
                paidById: data.payerId,
                paidBy: prev.members.find(
                  (m: any) => m.user.id === data.payerId,
                ),
              }
            : e,
        ),
      }),
      false,
    );

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      mutate(key);
    } catch {
      mutate(key);

      setToast({
        message: "Update failed",
        type: "error",
        id: Date.now(),
      });
    }
  };

  // =========================
  // CREATE
  // =========================
  const createExpense = async (data: any) => {
    const tempId = "temp-" + Date.now();

    const tempExpense = {
      id: tempId,
      description: data.description,
      amount: Number(data.amount),
      paidById: data.payerId,
      paidBy: {
        user: {
          id: data.payerId,
          name: "You",
        },
      },
      createdAt: new Date().toISOString(),
    };

    // ✅ optimistic
    mutate(
      key,
      (prev: any) => ({
        ...prev,
        expenses: [tempExpense, ...prev.expenses],
      }),
      false,
    );

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          groupId, // 🔥 FIX
        }),
      });

      if (!res.ok) throw new Error();

      const newExpense = await res.json();

      mutate(
        key,
        (prev: any) => ({
          ...prev,
          expenses: prev.expenses.map((e: any) =>
            e.id === tempId ? newExpense : e,
          ),
        }),
        false,
      );

      mutate(key);
    } catch (err) {
      console.error(err);

      // ❌ rollback
      mutate(
        key,
        (prev: any) => ({
          ...prev,
          expenses: prev.expenses.filter((e: any) => e.id !== tempId),
        }),
        false,
      );
    }
  };

  return {
    editingExpense,
    setEditingExpense,
    setDeleteId,
    deleting,
    handleDeleteExpense,
    updateExpense,
    createExpense,
  };
};
