"use client";

import { useState } from "react";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEdit2,
  FiFileText,
} from "react-icons/fi";

type Props = {
  expenses: any[];
  members: any[]; // ✅ required
  currentUserId?: string; // ✅ required for "You"
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
};

export default function ExpenseList({
  expenses,
  members,
  currentUserId,
  onEdit,
  onDelete,
  loading,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // =========================
  // SORT (latest first)
  // =========================
  const sortedExpenses = [...(expenses || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date: string) => {
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
  };

  // =========================
  // GROUP BY DATE
  // =========================
  const grouped: Record<string, any[]> = {};

  sortedExpenses.forEach((exp) => {
    const key = formatDate(exp.createdAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(exp);
  });

  // =========================
  // EMPTY STATE
  // =========================
  if (!sortedExpenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* ICON CONTAINER */}
        <div
          className="
                    w-20 h-20 rounded-full
                    bg-white/5 backdrop-blur-xl
                    border border-white/10
                    flex items-center justify-center
                    shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                    mb-4
                "
        >
          <span className="text-3xl">
            <FiFileText size={28} />
          </span>
        </div>

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-300 tracking-tight">
          No expenses yet
        </h3>

        {/* SUBTEXT */}
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Start tracking by adding your first expense in this group
        </p>
      </div>
    );
  }

  // =========================
  // GET PAYER NAME (FIXED)
  // =========================
  const getPayerName = (payerId: string) => {
    if (!payerId) return "Unknown";

    // ✅ show "You" only if correct match
    if (currentUserId && payerId === currentUserId) {
      return "You";
    }

    const member = members.find((m: any) => m.user.id === payerId);

    return member?.user?.name || member?.user?.email || "Unknown";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white p-4 rounded-xl shadow-sm"
          >
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-gray-400 my-2 px-1 tracking-wide uppercase">
            {date}
          </p>

          <div className="space-y-2">
            {items.map((exp) => (
              <div
                key={exp.id}
                className="group relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-center"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  {/* AVATAR */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
      ${
        currentUserId === exp.paidById
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
                  >
                    {getPayerName(exp.paidById)?.charAt(0)}
                  </div>

                  {/* TEXT */}
                  <div>
                    <p className="font-semibold text-gray-800 leading-tight">
                      {exp.description}
                    </p>

                    <p className="text-sm mt-0.5 text-gray-500">
                      {currentUserId === exp.paidById ? (
                        <span className="text-green-600 font-medium">
                          You paid ₹{exp.amount}
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-800">
                            {getPayerName(exp.paidById)}
                          </span>{" "}
                          paid ₹{exp.amount}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                  {/* AMOUNT */}
                  <p className="font-semibold text-lg text-gray-900">
                    ₹{exp.amount}
                  </p>

                  {/* MENU */}
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === exp.id ? null : exp.id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-600"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                </div>

                {/* DROPDOWN (same as yours) */}
                {openMenuId === exp.id && (
                  <div className="absolute right-0 top-10 z-50">
                    {/* BACKDROP CLICK AREA (optional premium UX) */}
                    <div
                      className="fixed inset-0"
                      onClick={() => setOpenMenuId(null)}
                    />

                    {/* MENU */}
                    <div
                      className="
                                            relative w-44 rounded-2xl
                                            bg-white/80 backdrop-blur-xl
                                            border border-white/20
                                            shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                                            p-1
                                            animate-in fade-in zoom-in-95 duration-150
                                        "
                    >
                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(exp);
                        }}
                        className="
                                                    flex items-center gap-3 w-full
                                                    px-4 py-2.5 rounded-xl
                                                    text-sm font-medium text-gray-700
                                                    hover:bg-gray-100/70
                                                    transition-all duration-150
                                                    "
                      >
                        <span className="text-lg">
                          <FiEdit2 size={16} />
                        </span>
                        Edit Expense
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(exp.id);
                        }}
                        className="
                                                    flex items-center gap-3 w-full
                                                    px-4 py-2.5 rounded-xl
                                                    text-sm font-medium text-red-600
                                                    hover:bg-red-50
                                                    transition-all duration-150
                                                    "
                      >
                        <span className="text-lg">
                          <FiTrash2 size={16} />
                        </span>
                        Delete Expense
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
