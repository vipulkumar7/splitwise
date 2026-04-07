"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "../ui/NotificationBell";
import { CgProfile } from "react-icons/cg";
import LogoutButton from "../ui/Logout";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = session?.user;

  // 🔥 close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">

      {/* 🔥 LOGO */}
      <h1
        className="font-bold text-2xl cursor-pointer text-gray-800"
        onClick={() => router.push("/groups")}
      >
        Splitwise
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">

        {session?.user && <NotificationBell />}

        {/* 🔥 AVATAR + DROPDOWN */}
        {session?.user && (
          <div className="relative" ref={ref}>

            {/* AVATAR */}
            <button onClick={() => setOpen(!open)}>
              {user?.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border shadow-sm hover:scale-105 transition"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-semibold shadow">
                  {user?.name?.[0] || user?.email?.[0]}
                </div>
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border overflow-hidden animate-fadeIn">

                {/* USER INFO */}
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* PROFILE */}
                <button
                  onClick={() => {
                    router.push("/profile");
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
                >
                  <CgProfile className="text-lg text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </button>
                <LogoutButton />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}