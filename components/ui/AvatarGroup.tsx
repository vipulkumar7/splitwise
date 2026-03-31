"use client";
import { useState } from "react";

export default function AvatarGroup({ members }: { members: any[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex -space-x-2">
      {members.map((m: any) => (
        <div
          key={m.user.id}
          onMouseEnter={() => setHovered(m.user.id)}
          onMouseLeave={() => setHovered(null)}
          className="relative"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm border cursor-pointer">
            {m.user.name?.[0] || m.user.email[0]}
          </div>

          {/* Tooltip */}
          {hovered === m.user.id && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow">
              {m.user.name || m.user.email}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}