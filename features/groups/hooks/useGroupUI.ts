"use client";

import { useState } from "react";
import { ToastType } from "@/components/ui/Toast";

export const useGroupUI = () => {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
        id: number;
    } | null>(null);

    const [addingExpense, setAddingExpense] = useState(false);

    return {
        toast,
        setToast,
        addingExpense,
        setAddingExpense,
    };
};