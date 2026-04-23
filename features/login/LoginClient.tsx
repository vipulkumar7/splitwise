"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export default function LoginClient() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    await signIn("google", {
      callbackUrl: "/friends",
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* CARD */}
      <div
        style={{ padding: "32px", borderRadius: "12px" }}
        className="w-full max-w-md text-center bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8"
      >
        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-white mb-2">Splitwise</h1>

        <p className="text-gray-400 text-sm mb-6">
          Split expenses with friends easily 💸
        </p>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all duration-200
            ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-black hover:scale-[1.02] hover:shadow-lg active:scale-95"
            }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <FcGoogle size={20} />
              Continue with Google
            </>
          )}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <div className="flex-1 h-px bg-white/10 mt-4 mb-4" />
          Secure login
          <div className="flex-1 h-px bg-white/10 mt-4 mb-4" />
        </div>

        {/* FOOTER */}
        <p className="text-xs text-gray-500 mt-4">
          Powered by NextAuth + Google OAuth
        </p>
      </div>
    </div>
  );
}
