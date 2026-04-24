"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiUser } from "react-icons/fi";
import { FaUserFriends } from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";

const NAV_ITEMS = [
  { icon: <FaUserFriends size={22} />, label: "Friends", path: "/friends" },
  { icon: <FiHome size={22} />, label: "Groups", path: "/groups" },
  { icon: <FiUser size={22} />, label: "Profile", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // ✅ Reset loading on route change
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const handleNavigate = useCallback(
    (path: string) => {
      if (loadingPath) return;
      if (pathname === path) return;
      setLoadingPath(path);
      router.replace(path);
    },
    [pathname, router, loadingPath],
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50">
      <div className="bg-zinc-950 border-t border-white/10 backdrop-blur-md">
        <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)] text-white">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const isLoading = loadingPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                disabled={isLoading}
                className={`flex flex-col items-center gap-1 transition ${
                  isLoading ? "opacity-50" : "active:scale-95"
                }`}
              >
                <div
                  className={`transition ${
                    isActive ? "text-green-500 scale-110" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-xs ${
                    isActive ? "text-green-500 font-medium" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && !isLoading && (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
