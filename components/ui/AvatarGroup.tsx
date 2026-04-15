"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";

export default function AvatarGroup({ members = [] }: { members: any[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [activeId, setActiveId] = useState<string | null>(null);

  // ✅ Memoized sliced members
  const visibleMembers = useMemo(() => members.slice(0, 4), [members]);

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?";

  const isCurrentUser = (id: string) => String(id) === String(currentUserId);

  return (
    <div className="flex items-center -space-x-3 mt-1">
      {visibleMembers.map((m: any, i: number) => {
        const user = m?.user;
        const id = user?.id || i;
        const name = user?.name || user?.email || "User";
        const isYou = isCurrentUser(id);

        return (
          <div
            key={id}
            className="relative"
            onMouseEnter={() => setActiveId(id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => setActiveId((prev) => (prev === id ? null : id))}
          >
            {/* Avatar */}
            <div
              className={`
                w-9 h-9 rounded-full border-2 border-white 
                flex items-center justify-center text-sm font-semibold 
                shadow-sm cursor-pointer transition-transform duration-200
                ${
                  isYou
                    ? "bg-blue-500 text-white ring-2 ring-blue-300"
                    : "bg-gray-300 text-gray-700 hover:scale-110"
                }
              `}
            >
              {getInitial(name)}
            </div>

            {/* Tooltip */}
            {activeId === id && (
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded-md shadow-md z-50 animate-fadeIn">
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
