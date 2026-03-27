"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="font-bold text-lg">Splitwise</h1>

      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>

        <Link href="/groups" className="hover:underline">
          Groups
        </Link>

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