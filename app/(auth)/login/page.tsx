"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="border p-8 rounded w-[300px] text-center space-y-4">
        <h1 className="text-xl font-bold">Splitwise</h1>

        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/groups", // 👈 important
            })
          }
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}