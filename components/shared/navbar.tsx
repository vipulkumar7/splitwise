"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBell from "../ui/NotificationBell";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setNotifications);
  }, []);

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="font-bold text-2xl cursor-pointer" onClick={() => router.push("/groups")}>Splitwise</h1>

      <div className="flex items-center gap-4">

        <Link href="/groups" className="hover:underline">
          Groups
        </Link>

        <NotificationBell />

        <Link href="/profile" className="hover:underline">
          Profile
        </Link>

        {session?.user && (
          <button
            onClick={() => signOut()}
            className="text-red-500"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}