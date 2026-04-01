"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBell from "../ui/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1
        className="font-bold text-2xl cursor-pointer"
        onClick={() => router.push("/groups")}
      >
        Splitwise
      </h1>

      <div className="flex items-center gap-4">
        {session?.user && (
          <Link href="/groups" className="hover:underline">
            Groups
          </Link>
        )}

        {session?.user && (
          <>
            {/* 🔔 Notification Bell */}
            <NotificationBell />
          </>
        )}

        {session?.user && (
          <Link href="/profile" className="hover:underline">
            Profile
          </Link>
        )}

        {session?.user && (
          <button onClick={() => signOut()} className="text-red-500">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}