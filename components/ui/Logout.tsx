"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbLogout } from "react-icons/tb";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    await signOut({
      redirect: false,
    });
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      disabled={loading}
      onClick={handleLogout}
      className={`w-full flex items-center gap-3 px-4 py-2 transition
        ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"}
      `}
    >
      {loading ? (
        <>
          {/* Spinner */}
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-red-500">
            Logging out...
          </span>
        </>
      ) : (
        <>
          <TbLogout className="text-lg text-red-500" />
          <span className="text-sm font-medium text-red-500">Logout</span>
        </>
      )}
    </button>
  );
}
