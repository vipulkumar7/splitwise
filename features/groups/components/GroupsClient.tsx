"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import GroupSkeleton from "@/components/ui/GroupSkeleton";
import Toast from "@/components/ui/Toast";
import { IGroup, IToast } from "@/types";
import { getTotalAmount, getMemberCount } from "./utils";

export default function GroupsClient({
  initialGroups,
}: {
  initialGroups: IGroup[];
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [groups, setGroups] = useState<IGroup[]>(initialGroups);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<IToast | null>(null);

  const createGroup = useCallback(async () => {
    if (!name.trim() || creating) return;

    setCreating(true);

    const tempId = "temp-" + Date.now();

    const tempGroup: IGroup = {
      id: tempId,
      name,
      members: [
        {
          user: {
            id: session?.user?.id as string,
            name: session?.user?.name || "You",
            email: session?.user?.email as string,
          },
        },
      ],
      expenses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemp: true,
    };

    setGroups((prev) => [tempGroup, ...prev]);
    setName("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();

      const newGroup: IGroup = await res.json();

      setGroups((prev) => prev.map((g) => (g.id === tempId ? newGroup : g)));

      setToast({
        id: Date.now(),
        message: "Group created 🎉",
        type: "success",
      });
    } catch {
      setGroups((prev) => prev.filter((g) => g.id !== tempId));

      setToast({
        id: Date.now(),
        message: "Failed to create ❌",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  }, [name, creating, session]);

  const handleNavigate = useCallback(
    (id: string) => {
      if (loading) return;
      setLoading(true);
      router.push(`/groups/${id}`);
    },
    [router, loading],
  );

  return (
    <div className="w-full max-w-2xl mx-auto h-full min-h-0 flex flex-col px-4 text-white">
      {/* CREATE */}
      <div className="mt-4 mb-2 flex gap-4 rounded-2xl">
        <input
          style={{ padding: "12px" }}
          type="text"
          name="group"
          id="group"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Create a new group..."
          className="flex-1 rounded-xl border border-red-400 text-black px-4 outline-none"
        />

        <button
          onClick={createGroup}
          disabled={!name.trim() || creating}
          className="px-5 py-2 rounded-xl bg-green-500 disabled:opacity-50"
        >
          {creating ? "Adding..." : "+ Add"}
        </button>
      </div>
      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 no-scrollbar">
        {groups.length === 0 && <GroupSkeleton />}
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => handleNavigate(group.id)}
            className="w-full mt-2 mb-2 p-4 rounded-2xl bg-white text-black flex justify-between hover:scale-[1.01] transition disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              <div className="flex -space-x-2">
                {group.members?.slice(0, 3).map((m, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center text-sm border-2 border-white"
                  >
                    {m.user.name?.[0]}
                  </div>
                ))}
              </div>

              <div className="text-left">
                <h2 className="font-semibold">{group.name}</h2>
                <p className="text-sm text-gray-500">
                  {getMemberCount(group)} members
                </p>
              </div>
            </div>

            <p className="text-green-600 font-semibold">
              ₹{getTotalAmount(group)}
            </p>
          </div>
        ))}
      </div>
      {/* TOAST */}
      {toast && <Toast key={toast.id} {...toast} duration={3000} />}
    </div>
  );
}
