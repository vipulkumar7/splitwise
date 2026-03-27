"use client";

export default function FloatingButton({ onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-5 bg-green-500 text-white w-14 h-14 rounded-full text-2xl shadow-xl flex items-center justify-center"
        >
            +
        </button>
    );
}