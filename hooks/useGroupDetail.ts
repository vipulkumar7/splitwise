"use client";

import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { exit } from "process";
import { useEffect, useState } from "react";

export const useGroupDetail = (groupId: string) => {
    const router = useRouter();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: "", type: "success" });
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
                setToast({
                    message: "Group deleted ❌",
                    type: "error"
                });
                return;
            }

            const data = await res.json();
            setGroup(data);

        } catch (e) {
            console.error(e);
            setToast({
                message: "Failed to load group",
                type: "error"
            });
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

            setToast({
                message: res.ok ? "Expense added 🎉" : "Failed to add expense ❌",
                type: res.ok ? "success" : "error",
            });

            if (!res.ok) throw new Error();

            await fetchGroup(true); // refresh data

        } catch (err) {
            console.error(err);
            setToast({
                message: "Failed to add expense ❌",
                type: "error",
            });
        } finally {
            setAddingExpense(false);
        }
    };

    const deleteGroup = async () => {
        try {

            const res = await fetch(`/api/groups/${groupId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error();

            // ✅ TOAST
            setToast({
                message: "Group deleted successfully",
                type: "success",
            });

            router.push("/groups");
        } catch (err) {
            console.error(err);

            setToast({
                message: "Failed to delete group",
                type: "error",
            });
        }
    };

    const exitGroup = async (userId: string) => {
        try {

            const res = await fetch(`/api/groups/${groupId}/exit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("EXIT ERROR:", err);
                throw new Error("Exit failed");
            }

            // ✅ TOAST
            setToast({
                message: "You left the group",
                type: "info",
            });

            router.push("/groups");
        } catch (err) {
            console.error(err);

            setToast({
                message: "Failed to exit group",
                type: "error",
            });
        }
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
            setToast({
                message: "Expense deleted 🎉",
                type: "success",
            });

        } catch (err) {
            console.error(err);
            setToast({
                message: "Failed to delete expense ❌",
                type: "error",
            });
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