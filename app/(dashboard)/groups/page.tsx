"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GroupSkeleton from "@/components/ui/GroupSkeleton";
import Toast, { ToastType } from "@/components/ui/Toast";

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // 🔥 SORT: latest created OR updated on top
  const sortedGroups = [...groups].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
  );

  // =========================
  // FETCH GROUPS
  // =========================
  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/groups");

      if (!res.ok) {
        setGroups([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // =========================
  // LOAD SAVED GROUP
  // =========================
  useEffect(() => {
    const savedGroupId = localStorage.getItem("selectedGroupId");
    if (savedGroupId) {
      setSelectedGroupId(savedGroupId);
    }
  }, []);

  // =========================
  // AUTO SELECT FIRST GROUP
  // =========================
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      const saved = localStorage.getItem("selectedGroupId");

      if (saved) {
        setSelectedGroupId(saved);
      } else {
        setSelectedGroupId(groups[0].id);
        localStorage.setItem("selectedGroupId", groups[0].id);
      }
    }
  }, [groups]);

  // =========================
  // CREATE GROUP
  // =========================
  const createGroup = async () => {
    if (!name.trim() || creating) return;

    try {
      setCreating(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setToast({
          message: "Group created 🎉",
          type: "success",
          id: Date.now()
        });
        setName("");
        fetchGroups();

      } else {
        setToast({
          message: "Failed to create group ❌",
          type: "error",
          id: Date.now()
        });
      }
      setTimeout(() => setToast({ message: "", type: "success", id: Date.now() }), 3000);
    } catch (err) {
      console.error(err);
      setToast({
        message: "Something went wrong ❌",
        type: "error",
        id: Date.now()
      });
      setTimeout(() => setToast({ message: "", type: "success", id: Date.now() }), 3000);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Create Group */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border mb-4">

        {/* INPUT */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Create a new group..."
          className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />

        {/* ADD BUTTON */}
        <button
          onClick={createGroup}
          disabled={creating || !name.trim()}
          className={`px-5 py-2 rounded-xl text-white font-semibold transition-all duration-200
              ${creating || !name.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 active:scale-95"
            }
          `}
        >
          {creating ? "Creating..." : "+ Add"}
        </button>
      </div>

      {/* =========================
          LOADING STATE (SKELETON)
         ========================= */}
      {loading && <GroupSkeleton />}

      {/* =========================
          EMPTY STATE
         ========================= */}
      {!loading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border shadow-sm">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-inner">
            <span className="text-2xl">👥</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-2">
            No groups yet
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm max-w-sm">
            Start by creating a group to split expenses with friends,
            family, or roommates.
          </p>

          {/* CTA */}
          <button
            onClick={() => document.querySelector("input")?.focus()}
            className="mt-6 px-6 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 transition"
          >
            Create your first group
          </button>
        </div>
      )}

      {/* =========================
          GROUP LIST
         ========================= */}
      {!loading && groups.length > 0 && (
        <div className="space-y-4">
          {groups
            .sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt).getTime() -
                new Date(a.updatedAt || a.createdAt).getTime()
            )
            .map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="cursor-pointer p-4 rounded-2xl border bg-white/70 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-between items-center"
              >
                {/* LEFT SIDE */}
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

                  {/* TEXT */}
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {group.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₹{group.expenses?.reduce(
                      (sum: number, e: any) => sum + e.amount,
                      0
                    ) || 0}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )
      }
      {/* TOAST */}
      {toast && <Toast message={toast.message} type={toast.type as "success" | "error"} />}
    </div >
  );
}