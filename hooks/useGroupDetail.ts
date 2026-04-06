"use client";

import { useEffect, useState } from "react";

export const useGroupDetail = (groupId: string) => {
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [addingExpense, setAddingExpense] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroup = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);   // ✅ shimmer only
            } else {
                setLoading(true);      // ✅ first load
            }

            const res = await fetch(`/api/groups/${groupId}`);

            if (res.status === 404) {
                setToast("Group deleted ❌");
                return;
            }

            const data = await res.json();
            setGroup(data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroup(true);
    }, [groupId]);

    const addExpense = async ({
        description,
        amount,
        payerId,
    }: any) => {
        if (!description || !amount) return;

        try {
            setAddingExpense(true);

            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    description,
                    amount: Number(amount),
                    payerId,
                    groupId,
                }),
            });

            if (!res.ok) throw new Error();

            await fetchGroup(true); // refresh data

        } catch (err) {
            console.error(err);
        } finally {
            setAddingExpense(false);
        }
    };

    const deleteGroup = async () => {
        await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
        setToast("Deleted 🗑️");
        setTimeout(() => (window.location.href = "/groups"), 1500);
    };

    const exitGroup = async (userId: string) => {
        await fetch("/api/groups/remove-member", {
            method: "POST",
            body: JSON.stringify({ userId, groupId }),
        });

        setToast("Exited 🚪");
        setTimeout(() => (window.location.href = "/groups"), 1500);
    };

    const deleteExpense = async (id: string) => {
        try {
            const res = await fetch(
                `/api/expenses/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                console.error("Delete failed");
                return;
            }

            // 🔥 refresh group data
            await fetchGroup(true);

            // 🔥 optional toast
            setToast("Expense deleted 🗑️");

        } catch (err) {
            console.error(err);
        }
    };

    return {
        group,
        loading,
        refreshing,
        toast,
        setToast,
        addExpense,
        setAddingExpense,
        addingExpense,
        deleteGroup,
        exitGroup,
        deleteExpense,
        fetchGroup
    };
};