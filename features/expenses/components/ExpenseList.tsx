"use client";

import { useMemo, useState, useCallback } from "react";
import { FiMoreVertical, FiTrash2, FiEdit2, FiFileText } from "react-icons/fi";

type Props = {
  expenses: any[];
  members: any[];
  currentUserId?: string;
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

export default function ExpenseList({
  expenses = [],
  members = [],
  currentUserId,
  onEdit,
  onDelete,
  loading,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // =========================
  // FORMAT DATE (MEMO SAFE)
  // =========================
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

  // =========================
  // GROUP + SORT (MEMOIZED)
  // =========================
  const groupedExpenses = useMemo(() => {
    if (!expenses.length) return {};

    const sorted = [...expenses].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const grouped: Record<string, any[]> = {};

    sorted.forEach((exp) => {
      const key = formatDate(exp.createdAt);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(exp);
    });

    return grouped;
  }, [expenses, formatDate]);

  // =========================
  // GET PAYER NAME (FAST)
  // =========================
  const getPayerName = useCallback(
    (payerId: string) => {
      if (!payerId) return "Unknown";

      if (currentUserId && payerId === currentUserId) {
        return "You";
      }

      const member = members.find((m: any) => m.user.id === payerId);

      return member?.user?.name || member?.user?.email || "Unknown";
    },
    [members, currentUserId],
  );

  // =========================
  // HANDLERS (STABLE)
  // =========================
  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleEditClick = useCallback(
    (exp: any) => {
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

  // =========================
  // LOADING
  // =========================
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

  // =========================
  // EMPTY STATE
  // =========================
  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border flex items-center justify-center mb-4">
          <FiFileText size={28} />
        </div>

        <h3 className="text-lg font-semibold text-gray-300">No expenses yet</h3>

        <p className="text-sm text-gray-400 mt-1">
          Start tracking by adding your first expense
        </p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-gray-400 my-2 uppercase">
            {date}
          </p>

          <div className="space-y-2">
            {items.map((exp) => {
              const payerName = getPayerName(exp.paidById);

              return (
                <div
                  key={exp.id}
                  className="group bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentUserId === exp.paidById
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payerName?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {exp.description}
                      </p>

                      <p className="text-sm text-gray-500">
                        {currentUserId === exp.paidById ? (
                          <span className="text-green-600 font-medium">
                            You paid ₹{exp.amount}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium text-gray-800">
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
                        onClick={() => toggleMenu(exp.id)}
                        className="p-1 text-gray-400 hover:text-gray-700"
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
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-100"
                            >
                              <FiEdit2 size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteClick(exp.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-red-600 hover:bg-red-50"
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
