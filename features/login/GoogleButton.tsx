import { FcGoogle } from "react-icons/fc";

interface Props {
  loading: boolean;
  onClick: () => void;
}

export default function GoogleButton({ loading, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`relative w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium
        transition-all duration-300 overflow-hidden
        ${
          loading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:scale-[1.02] active:scale-95 shadow-md"
        }`}
    >
      {/* 🔥 HOVER GLOW */}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />

      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
          Logging in...
        </>
      ) : (
        <>
          <FcGoogle size={22} />
          Continue with Google
        </>
      )}
    </button>
  );
}
