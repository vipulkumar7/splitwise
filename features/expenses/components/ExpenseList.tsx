"use client";

import { IExpense, IExpenseList, IUser } from "@/types";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { FiMoreVertical, FiTrash2, FiEdit2, FiFileText } from "react-icons/fi";
import { createPortal } from "react-dom";

export default function ExpenseList({
  expenses,
  members,
  currentUserId,
  onEdit,
  onDelete,
  loading = false,
}: IExpenseList) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // =========================
  // MEMBER MAP
  // =========================
  const memberMap = useMemo(() => {
    const map = new Map<string, IUser>();
    members.forEach((m) => {
      map.set(m.user.id as string, m.user as IUser);
    });
    return map;
  }, [members]);

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = useCallback((date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = useCallback((date: Date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // =========================
  // GROUP EXPENSES
  // =========================
  const groupedExpenses = useMemo<Record<string, IExpense[]>>(() => {
    if (!expenses.length) return {};

    const sorted = [...expenses].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted.reduce(
      (acc, exp) => {
        const key = formatDate(exp.createdAt);
        (acc[key] ||= []).push(exp);
        return acc;
      },
      {} as Record<string, IExpense[]>,
    );
  }, [expenses, formatDate]);

  // =========================
  // GET NAME
  // =========================
  const getPayerName = useCallback(
    (payerId: string) => {
      if (!payerId) return "Unknown";
      if (payerId === currentUserId) return "You";

      const user = memberMap.get(payerId);
      return user?.name || user?.email || "Unknown";
    },
    [memberMap, currentUserId],
  );

  // =========================
  // MENU HANDLER (PORTAL)
  // =========================
  const toggleMenu = useCallback(
    (id: string) => {
      if (openMenuId === id) {
        setOpenMenuId(null);
        return;
      }

      const btn = buttonRefs.current[id];
      if (!btn) return;

      const rect = btn.getBoundingClientRect();

      setMenuPos({
        top: rect.bottom - 4,
        left: rect.right - 110, // align right
      });

      setOpenMenuId(id);
    },
    [openMenuId],
  );

  // =========================
  // OUTSIDE CLICK CLOSE
  // =========================
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white/10 p-4 rounded-xl">
            <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // =========================
  // EMPTY
  // =========================
  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <FiFileText size={28} className="text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-white">No expenses yet</h3>

        <p className="text-sm text-gray-400 mt-1">
          Start tracking by adding your first expense
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-3">
      {Object.entries(groupedExpenses).map(([date, items]) => (
        <div key={date}>
          {/* DATE HEADER */}
          <p className="text-xs font-semibold text-gray-400 mt-2 mb-2 uppercase">
            {date}
          </p>

          <div className="space-y-3">
            {items.map((exp) => {
              const payerName = getPayerName(exp.paidById as string);
              const isYou = exp.paidById === currentUserId;

              return (
                <div
                  key={exp.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center relative"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        isYou ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {payerName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-white font-semibold">
                        {exp.description}
                      </p>

                      <p className="text-sm text-gray-400">
                        {isYou ? "You paid" : `${payerName} paid`} •{" "}
                        {formatTime(exp.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-lg">
                      ₹{exp.amount}
                    </p>

                    <button
                      ref={(el) => {
                        buttonRefs.current[exp.id as string] = el;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(exp.id as string);
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <FiMoreVertical size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ========================= */}
      {/* PORTAL MENU */}
      {/* ========================= */}
      {openMenuId &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
            }}
            className="z-[9999] bg-white border border-white/10 rounded-xl shadow-xl w-24"
          >
            <button
              onClick={() => {
                const exp = expenses.find((e) => e.id === openMenuId);
                if (exp) onEdit(exp);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-black hover:bg-white/10 rounded-lg"
            >
              <FiEdit2 size={14} />
              Edit
            </button>

            <button
              onClick={() => {
                onDelete(openMenuId);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <FiTrash2 size={14} />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
