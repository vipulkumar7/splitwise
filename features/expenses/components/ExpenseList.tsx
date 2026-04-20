"use client";

import { IExpense, IExpenseList, IUser } from "@/types";
import { useMemo, useState, useCallback } from "react";
import { FiMoreVertical, FiTrash2, FiEdit2, FiFileText } from "react-icons/fi";

export default function ExpenseList({
  expenses,
  members,
  currentUserId,
  onEdit,
  onDelete,
  loading = false,
}: IExpenseList) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const memberMap = useMemo(() => {
    const map = new Map<string, IUser>();
    members.forEach((m) => {
      map.set(m.user.id as string, m?.user as IUser);
    });
    return map;
  }, [members]);

  const formatDate = useCallback((date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }, []);

  const groupedExpenses = useMemo<Record<string, IExpense[]>>(() => {
    if (!expenses.length) return {};

    const sorted = [...expenses].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted.reduce<Record<string, IExpense[]>>((acc, exp) => {
      const key = formatDate(exp.createdAt as any);
      (acc[key] ||= []).push(exp);
      return acc;
    }, {});
  }, [expenses, formatDate]);

  const getPayerName = useCallback(
    (payerId: string) => {
      if (!payerId) return "Unknown";

      if (payerId === currentUserId) return "You";

      const user = memberMap.get(payerId);
      return user?.name || user?.email || "Unknown";
    },
    [memberMap, currentUserId],
  );

  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleEditClick = useCallback(
    (exp: IExpense) => {
      setOpenMenuId(null);
      onEdit(exp);
    },
    [onEdit],
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      setOpenMenuId(null);
      onDelete(id);
    },
    [onDelete],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-xl">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border flex items-center justify-center mb-4">
          <FiFileText size={28} />
        </div>

        <h3 className="text-lg font-semibold text-white">No expenses yet</h3>

        <p className="text-sm text-gray-400 mt-1">
          Start tracking by adding your first expense
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {Object.entries(groupedExpenses).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-white mt-2 mb-2 uppercase">
            {date}
          </p>

          <div className="space-y-2">
            {items.map((exp) => {
              const payerName = getPayerName(exp.paidById as string);
              const isYou = exp.paidById === currentUserId;

              return (
                <div
                  key={exp.id}
                  className="group bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        isYou ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {payerName.charAt(0).toUpperCase()}
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="font-semibold text-black">
                        {exp.description}
                      </p>

                      <p className="text-sm text-gray-500">
                        {isYou ? (
                          <span className="text-green-600 font-medium">
                            You paid ₹{exp.amount}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium text-black">
                              {payerName}
                            </span>{" "}
                            paid ₹{exp.amount}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">₹{exp.amount}</p>

                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(exp.id as string)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                        aria-label="Open menu"
                      >
                        <FiMoreVertical size={18} />
                      </button>

                      {openMenuId === exp.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />

                          <div className="absolute right-0 mt-2 z-50 bg-white rounded-xl shadow-lg border p-1">
                            <button
                              onClick={() => handleEditClick(exp)}
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-black hover:bg-gray-100"
                              aria-label="Edit"
                            >
                              <FiEdit2 size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteClick(exp.id as string)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-red-500 hover:bg-red-50"
                              aria-label="Delete"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
