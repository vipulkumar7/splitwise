"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const path = usePathname();
    const { data: session } = useSession();

    const navItem = (href: string, label: string) => (
        <Link
            href={href}
            className={`flex flex-col items-center text-xs ${path === href ? "text-black font-bold" : "text-gray-500"
                }`}
        >
            <span>{label}</span>
        </Link>
    );

    return (
        <div>
            {session?.user && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 shadow-md">
                    {navItem("/groups", "Groups")}
                    {navItem("/profile", "Profile")}
                </div>

            )}
        </div>
    );
}