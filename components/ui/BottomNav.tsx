"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiUser } from "react-icons/fi";

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
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
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full z-50">

            {/* GLASS BACKGROUND */}
            <div className="bg-white/80 backdrop-blur-xl border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">

                <div className="flex justify-around items-center h-16">

                    {navItems.map((item, index) => {
                        const isActive = pathname.startsWith(item.path);

                        return (
                            <button
                                key={index}
                                onClick={() => router.push(item.path)}
                                className="flex flex-col items-center justify-center gap-1 relative"
                            >
                                {/* ICON */}
                                <div
                                    className={`transition-all duration-200 ${isActive
                                            ? "text-green-600 scale-110"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {item.icon}
                                </div>

                                {/* LABEL */}
                                <span
                                    className={`text-xs ${isActive
                                            ? "text-green-600 font-medium"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {item.label}
                                </span>

                                {/* ACTIVE INDICATOR */}
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