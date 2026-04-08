"use client";

export default function Button({ loading, children, ...props }: any) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full py-3 rounded-xl text-white font-semibold transition-all
    flex items-center justify-center gap-2 shadow-lg
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] active:scale-[0.98]"
    }`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}

      {/* <span>{loading ? `${children}...` : children}</span> */}
      <span>{children}</span>
    </button>
  );
}
