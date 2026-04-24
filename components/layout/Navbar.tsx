"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { CgProfile } from "react-icons/cg";
import LogoutButton from "@/components/ui/Logout";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user;

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Navigate safely
  const navigate = useCallback(
    (path: string) => {
      if (loadingPath) return;

      setLoadingPath(path);
      setOpen(false);
      router.push(path);
    },
    [router, loadingPath],
  );

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b bg-zinc-950 text-white z-40">
      {/* LOGO */}
      <button
        onClick={() => navigate("/friends")}
        disabled={!!loadingPath}
        className="font-bold text-lg sm:text-xl disabled:opacity-50"
      >
        Splitwise
      </button>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {user && <NotificationBell />}

        {user && (
          <div className="relative" ref={ref}>
            {/* AVATAR */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              disabled={!!loadingPath}
              className="disabled:opacity-50"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-semibold">
                  {user?.name?.[0] || user?.email?.[0]}
                </div>
              )}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border overflow-hidden animate-fadeIn z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-black">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  disabled={!!loadingPath}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <CgProfile className="text-lg text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {loadingPath === "/profile" ? "Opening..." : "Profile"}
                  </span>
                </button>

                <LogoutButton />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
