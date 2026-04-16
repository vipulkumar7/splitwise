"use client";

import { motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import { useEffect, useCallback } from "react";
import { IConfirmModal } from "@/types";

export default function ConfirmModal({
  show,
  title,
  description,
  confirmText = "Confirm",
  onConfirm,
  onClose,
  loading = false,
  type = "default",
}: IConfirmModal) {
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

  const buttonStyles =
    type === "danger"
      ? loading
        ? "bg-red-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
      : loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[90%] max-w-[360px] bg-white rounded-2xl p-6 shadow-2xl border border-gray-100"
      >
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FiAlertTriangle className="text-red-500 text-xl" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-center text-gray-900">
          {title}
        </h2>

        {/* DESCRIPTION */}
        {description && (
          <p className="text-sm text-gray-500 text-center mt-2">
            {description}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">
          <button
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-white font-semibold transition active:scale-95 ${buttonStyles}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {confirmText}
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
