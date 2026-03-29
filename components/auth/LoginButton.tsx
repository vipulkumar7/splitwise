"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const params = useSearchParams();
    const callbackUrl = params.get("callbackUrl") || "/groups";

    return (
        <div className="p-6">
            <button
                onClick={() =>
                    signIn("google", { callbackUrl })
                }
                className="bg-black text-white px-4 py-2"
            >
                Sign in with Google
            </button>
        </div>
    );
}