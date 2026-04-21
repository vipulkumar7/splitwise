"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import GroupSkeleton from "@/components/ui/GroupSkeleton";
import Toast from "@/components/ui/Toast";
import { IGroup, IToast } from "@/types";

export default function GroupsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const [toast, setToast] = useState<IToast | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/groups", { cache: "no-store" });
      if (!res.ok) throw new Error();

      const data: IGroup[] = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // =========================
  // SORT (stable)
  // =========================
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [groups]);

  // =========================
  // CREATE GROUP
  // =========================
  const createGroup = async () => {
    if (!name.trim()) return;

    const tempId = "temp-" + Date.now();
    const groupName = name; // preserve before clearing

    const tempGroup: IGroup = {
      id: tempId,
      name: groupName,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemp: true,
    };

    // ✅ Optimistic insert at top
    setGroups((prev) => [tempGroup, ...prev]);
    setName("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error("Failed to create group");

      const newGroup: IGroup = await res.json();

      // ✅ Replace WITHOUT changing position
      setGroups((prev) =>
        prev.map((g) =>
          g.id === tempId
            ? {
                ...newGroup,
                updatedAt: new Date().toISOString(),
                members:
                  newGroup.members?.length > 0 ? newGroup.members : g.members,
              }
            : g,
        ),
      );

      setToast({
        message: "Group created 🎉",
        type: "success",
        id: Date.now(),
      });
    } catch (err) {
      console.error(err);

      // ❌ rollback
      setGroups((prev) => prev.filter((g) => g.id !== tempId));

      setToast({
        message: "Something went wrong ❌",
        type: "error",
        id: Date.now(),
      });
    }
  };

  const getMemberCount = (group: IGroup) => {
    if (group.members?.length > 0) return group.members.length;
    if (group.isTemp) return 1;
    return 0;
  };

  const getTotalAmount = (group: IGroup) =>
    group.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col overflow-hidden px-4 bg-zinc-950 text-white">
      {/* CREATE */}
      <div className="mt-3 flex gap-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-700">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Create a new group..."
          className="flex-1 bg-transparent text-white placeholder:text-white outline-none"
        />

        <button
          onClick={createGroup}
          disabled={!name.trim()}
          aria-label="Add"
          className={`px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium active:scale-95 transition disabled:opacity-50 ${!name && "cursor-not-allowed"}`}
        >
          + Add
        </button>
      </div>

      {/* LOADING */}
      {loading && <GroupSkeleton />}

      {/* LIST */}
      {!loading && (
        <div className="flex-1 overflow-y-auto space-y-4 mt-4 mb-36 no-scrollbar">
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="p-4 rounded-2xl border bg-white flex justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* AVATAR */}
                <div className="flex -space-x-2">
                  {group.members?.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-white"
                    >
                      {m.user.name?.[0]}
                    </div>
                  ))}

                  {group.members?.length > 3 && (
                    <div className="w-9 h-9 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-black">{group.name}</h2>
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
      )}

      {/* TOAST */}
      {toast && <Toast key={toast.id} {...toast} duration={3000} />}
    </div>
  );
}
