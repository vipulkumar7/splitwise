"use client";

import { useState } from "react";
import { mutate } from "swr";

export const useGroupPage = (
  groupId: string,
  fetchGroup: any,
  setShowDeleteConfirm: any,
  setToast: any,
) => {
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [addingExpense, setAddingExpense] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // DELETE EXPENSE (OPTIMISTIC)
  // =========================
  const handleDeleteExpense = async (deleteExpense: any) => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      // ✅ Optimistic UI
      fetchGroup(
        (prev: any) => ({
          ...prev,
          expenses: prev.expenses.filter((e: any) => e.id !== deleteId),
        }),
        false,
      );

      await deleteExpense(deleteId);
      mutate(`/api/groups/${groupId}`);

      setToast({
        message: "Expense deleted",
        type: "success",
        id: Date.now(),
      });
    } catch (err) {
      console.log(err);
      mutate(`/api/groups/${groupId}`);
      setToast({
        message: "Delete failed",
        type: "error",
        id: Date.now(),
      });
      //   fetchGroup(); // rollback
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  // =========================
  // UPDATE EXPENSE
  // =========================
  const updateExpense = async (data: any) => {
    // ✅ 1. OPTIMISTIC UPDATE (FIXED)
    mutate(
      `/api/groups/${groupId}`,
      (prev: any) => ({
        ...prev,
        expenses: prev.expenses.map((e: any) =>
          e.id === editingExpense.id
            ? {
                ...e,
                description: data.description,
                amount: Number(data.amount),
                paidById: data.payerId,

                // 🔥 FIX FOR PAYER UI
                paidBy: prev.members.find(
                  (m: any) => m.user.id === data.payerId,
                ),
              }
            : e,
        ),
      }),
      false, // ❗ no re-fetch yet
    );

    // ✅ 2. API CALL
    const res = await fetch(`/api/expenses/${editingExpense.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: data.description,
        amount: Number(data.amount),
        payerId: data.payerId,
      }),
    });

    // ❌ rollback if failed
    if (!res.ok) {
      mutate(`/api/groups/${groupId}`);
      throw new Error("Update failed");
    }

    // ✅ 3. REVALIDATE (sync with backend)
    mutate(`/api/groups/${groupId}`);
  };

  // =========================
  // ADD EXPENSE
  // =========================
  const createExpense = async (data: any, addExpense: any) => {
    const tempId = Date.now();

    // ✅ Optimistic
    fetchGroup(
      (prev: any) => ({
        ...prev,
        expenses: [{ id: tempId, ...data }, ...prev.expenses],
      }),
      false,
    );

    await addExpense({
      ...data,
      amount: Number(data.amount),
    });

    mutate((key) => typeof key === "string" && key.includes(groupId));

    setToast({
      message: "Expense added",
      type: "success",
      id: Date.now(),
    });
  };

  return {
    editingExpense,
    setEditingExpense,
    deleteId,
    setDeleteId,
    addingExpense,
    setAddingExpense,
    deleting,
    handleDeleteExpense,
    updateExpense,
    createExpense,
  };
};
