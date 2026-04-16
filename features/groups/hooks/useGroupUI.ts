"use client";

import { useState } from "react";
import { IToast } from "@/types";

export const useGroupUI = () => {
    const [toast, setToast] = useState<IToast | null>(null);

    const [addingExpense, setAddingExpense] = useState(false);

    return {
        toast,
        setToast,
        addingExpense,
        setAddingExpense,
    };
};