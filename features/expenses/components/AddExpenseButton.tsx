"use client";

import { FiPlus } from "react-icons/fi";

export default function AddExpenseButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="fixed bottom-20 right-0 pr-4 z-[999] group sm:right-6">
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-30 group-hover:opacity-50 transition" />

        {/* Button */}
        <div
          className="
            flex items-center justify-center
            rounded-full
            bg-green-500
            shadow-lg
            hover:shadow-2xl
            transition transform
            hover:scale-110 active:scale-95
          "
          style={{ width: "56px", height: "56px" }}
        >
          <FiPlus size={30} className="text-white" />
        </div>
      </div>
    </button>
  );
}
