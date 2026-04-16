"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiUser } from "react-icons/fi";
import { useCallback, useMemo } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = useMemo(
    () => [
      {
        icon: <FiHome size={22} />,
        label: "Groups",
        path: "/groups",
      },
      {
        icon: <FiUser size={22} />,
        label: "Profile",
        path: "/profile",
      },
    ],
    [],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      if (pathname !== path) {
        router.replace(path);
      }
    },
    [pathname, router],
  );

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="bg-white/80 backdrop-blur-xl border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 bg-zinc-950 text-white">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 relative active:scale-95 transition-transform"
                aria-label={item.label}
              >
                {/* ICON */}
                <div
                  className={`transition-all duration-200 ${
                    isActive ? "text-green-600 scale-110" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>

                {/* LABEL */}
                <span
                  className={`text-xs ${
                    isActive ? "text-green-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* ACTIVE DOT */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
