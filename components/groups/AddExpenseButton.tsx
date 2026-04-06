"use client";

import { FiPlus } from "react-icons/fi";

export default function AddExpenseButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-6 z-50 group"
        >
            <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-30 group-hover:opacity-50 transition" />

                {/* Button */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full
          bg-gradient-to-br from-green-400 to-green-600
          shadow-lg hover:shadow-2xl
          transition transform hover:scale-110 active:scale-95"
                >
                    <FiPlus className="text-white text-2xl" />
                </div>
            </div>
        </button>
    );
}