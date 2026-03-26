"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserMenu({ user }: any) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push("/profile")}
        className="border px-3 py-1 rounded"
      >
        {user?.name || user?.email}
      </button>

      <button
        onClick={() => signOut()}
        className="bg-gray-200 px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}