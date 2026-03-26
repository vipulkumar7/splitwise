"use client";

import { signIn } from "next-auth/react";

export default function LoginClient() {
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: "/dashboard", // important
          })
        }
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        Continue with Google
      </button>
    </div>
  );
}