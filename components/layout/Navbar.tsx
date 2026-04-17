"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import NotificationBell from "../../features/notifications/components/NotificationBell";
import { CgProfile } from "react-icons/cg";
import LogoutButton from "../ui/Logout";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = session?.user;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(false);
    },
    [router],
  );

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b backdrop-blur-md sticky top-0 z-50 bg-zinc-950 text-white">
      {/* LOGO */}
      <button
        onClick={() => router.push("/groups")}
        className="font-bold text-xl sm:text-2xl text-white"
      >
        Splitwise
      </button>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 sm:gap-5">
        {user && <NotificationBell />}

        {/* AVATAR + DROPDOWN */}
        {user && (
          <div className="relative" ref={ref}>
            {/* AVATAR */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="focus:outline-none"
              aria-label="User menu"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border shadow-sm hover:scale-105 transition"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-semibold shadow">
                  {user?.name?.[0] || user?.email?.[0]}
                </div>
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border overflow-hidden animate-fadeIn">
                {/* USER INFO */}
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-black">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* PROFILE */}
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 active:scale-95 transition"
                >
                  <CgProfile className="text-lg text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Profile
                  </span>
                </button>

                {/* LOGOUT */}
                <LogoutButton />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
