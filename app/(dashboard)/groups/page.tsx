"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import GroupSkeleton from "@/components/ui/GroupSkeleton";
import Toast, { ToastType } from "@/components/ui/Toast";

export default function GroupsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    id: number;
  } | null>(null);

  // =========================
  // FETCH
  // =========================
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/groups", { cache: "no-store" });

      if (!res.ok) throw new Error();

      const data = await res.json();
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
  // SORT
  // =========================
  const sortedGroups = useMemo(() => {
    return [...groups].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    );
  }, [groups]);

  // =========================
  // CREATE GROUP (FIXED)
  // =========================
  const createGroup = async () => {
    if (!name.trim()) return;

    const tempId = "temp-" + Date.now();

    const tempGroup = {
      id: tempId,
      name,
      members: [
        {
          user: {
            id: session?.user?.id,
            name: session?.user?.name || "You",
            email: session?.user?.email,
          },
        },
      ],
      expenses: [],
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    // ✅ Optimistic UI
    setGroups((prev) => [tempGroup, ...prev]);
    setName("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to create group");
      }

      const newGroup = await res.json();

      // ✅ Merge (IMPORTANT FIX)
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== tempId) return g;

          return {
            ...newGroup,
            members:
              newGroup.members && newGroup.members.length > 0
                ? newGroup.members
                : g.members, // keep optimistic
          };
        }),
      );

      // ✅ SUCCESS TOAST
      setToast({
        message: "Group created 🎉",
        type: "success",
        id: Date.now(),
      });
    } catch (err) {
      console.error(err);

      // ❌ Rollback
      setGroups((prev) => prev.filter((g) => g.id !== tempId));

      // ❌ ERROR TOAST (THIS IS WHAT YOU ASKED)
      setToast({
        message: "Something went wrong ❌",
        type: "error",
        id: Date.now(),
      });
    }
  };

  // =========================
  // HELPER (🔥 FIX HERE)
  // =========================
  const getMemberCount = (group: any) => {
    // ✅ if members exist
    if (group.members?.length > 0) {
      return group.members.length;
    }

    // ✅ if it's newly created group → show 1
    if (group.isTemp) return 1;

    // ✅ fallback
    return 0;
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col overflow-hidden px-4 bg-zinc-950 text-white">
      {/* CREATE */}
      <div className="mt-3 flex gap-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-700">
        <input
          name="create group"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Create a new group..."
          className="flex-1 bg-transparent text-white placeholder:text-white outline-none"
        />

        <button
          onClick={createGroup}
          disabled={!name.trim()}
          className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium active:scale-95 transition disabled:opacity-50"
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
                {/* 🔥 AVATAR STACK */}
                <div className="flex -space-x-2">
                  {group.members?.slice(0, 3).map((m: any, i: number) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-white shadow"
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

                  {/* 🔥 FIXED */}
                  <p className="text-sm text-gray-500">
                    {getMemberCount(group)} members
                  </p>
                </div>
              </div>

              <p className="text-green-600 font-semibold">
                ₹
                {group.expenses?.reduce(
                  (sum: number, e: any) => sum + e.amount,
                  0,
                ) || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TOAST */}
      {toast && <Toast key={toast.id} {...toast} />}
    </div>
  );
}
