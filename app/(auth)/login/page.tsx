"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export default function LoginClient() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return; // prevent double click

    setLoading(true);

    await signIn("google", {
      callbackUrl: "/groups",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">

      <div className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl text-center mb-40">

        <h1 className="text-3xl font-bold text-white mb-2">
          Splitwise
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          Split expenses with friends easily 💸
        </p>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 font-medium py-3 rounded-xl transition-all duration-200
            ${loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-white text-black hover:scale-[1.02] hover:shadow-lg"
            }`}
        >
          {loading ? (
            <>
              {/* Spinner */}
              <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <FcGoogle size={22} />
              Continue with Google
            </>
          )}
        </button>

        <div className="my-6 flex items-center gap-2 text-gray-500 text-xs">
          <div className="flex-1 h-px bg-gray-700" />
          Secure login
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <p className="text-xs text-gray-500">
          Powered by NextAuth + Google OAuth
        </p>
      </div>
    </div>
  );
}