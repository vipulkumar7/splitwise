"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AvatarGroup({ members }: { members: any[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex -space-x-3">
      {members.slice(0, 4).map((m: any, i: number) => {
        const isYou = m.user.id === currentUserId;

        return (
          <div
            key={i}
            title={m.user.name}
            onMouseEnter={() => setHovered(m.user.id)}
            onMouseLeave={() => setHovered(null)}
            className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold shadow-sm ${isYou
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
              }`}
          >
            {m.user.name?.[0]}
          </div>
        );
      })}

      {/* +COUNT */}
      {members.length > 4 && (
        <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
          +{members.length - 4}
        </div>
      )}
    </div>
  );
}