"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AvatarGroup({ members }: { members: any[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex items-center -space-x-3 mt-2">
      {members.slice(0, 4).map((m: any, i: number) => {
        const user = m?.user;
        const id = user?.id;
        const name = user?.name || user?.email || "User";
        const isYou = id === currentUserId;

        return (
          <div
            key={id || i}
            className="relative"
            onMouseEnter={() => setActiveId(id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => setActiveId((prev) => (prev === id ? null : id))} // ✅ mobile
          >
            {/* Avatar */}
            <div
              className={`
                w-9 h-9 rounded-full border-2 border-white 
                flex items-center justify-center text-sm font-semibold 
                shadow-sm cursor-pointer transition
                ${isYou
                  ? "bg-blue-500 text-white ring-2 ring-blue-200"
                  : "bg-gray-300 text-gray-700 hover:scale-105"
                }
              `}
            >
              {name?.charAt(0).toUpperCase()}
            </div>

            {/* Tooltip */}
            {activeId === id && (
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded-md shadow-md z-50">
                {isYou ? "You" : name}
              </div>
            )}
          </div>
        );
      })}

      {/* +COUNT */}
      {members.length > 4 && (
        <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium shadow-sm">
          +{members.length - 4}
        </div>
      )}
    </div>
  );
}