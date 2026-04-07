"use client";

import { useRouter } from "next/navigation";

export const useGroupActions = (
    groupId: string,
    fetchGroup: (refresh?: boolean) => Promise<void>,
    setToast: any
) => {
    const router = useRouter();

    const addExpense = async ({ description, amount, payerId }: any) => {
        if (!description || !amount) return;

        try {
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
                id: Date.now(),
            });

            if (!res.ok) throw new Error();

            await fetchGroup(true);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error();

            setToast({
                message: "Group deleted successfully",
                type: "success",
                id: Date.now(),
            });

            router.push("/groups");
        } catch (err) {
            console.error(err);
        }
    };

    const exitGroup = async (userId: string) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/exit`, {
                method: "POST",
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) throw new Error();

            setToast({
                message: "You left the group",
                type: "info",
                id: Date.now(),
            });

            router.push("/groups");
        } catch (err) {
            console.error(err);
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error();

            await fetchGroup(true);

            setToast({
                message: "Expense deleted 🎉",
                type: "success",
                id: Date.now(),
            });
        } catch (err) {
            console.error(err);
        }
    };

    return {
        addExpense,
        deleteGroup,
        exitGroup,
        deleteExpense,
    };
};