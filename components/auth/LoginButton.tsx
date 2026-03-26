"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn("google")}
            className="bg-black text-white px-4 py-2 rounded"
        >
            Login
        </button>
    );
}