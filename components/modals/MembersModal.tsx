"use client";

import { FiX } from "react-icons/fi";
import { useEffect, useCallback } from "react";
import { IMembersModalProps } from "@/types";

export default function MembersModal({
  show,
  onClose,
  members,
  currentUserId,
}: IMembersModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [show, handleEsc]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 text-black">
          <h2 className="text-lg font-semibold">Members</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 active:scale-95 transition"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar scroll-smooth">
          {members.map((m) => {
            const user = m?.user;

            if (!user) return null; // ✅ safety

            const name = user.name || user.email || "User";
            const isYou = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-black"
              >
                {/* AVATAR */}
                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>

                {/* NAME */}
                <span className="text-sm font-medium truncate text-black">
                  {isYou ? "You" : name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
