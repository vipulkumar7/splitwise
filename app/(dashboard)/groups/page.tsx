"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GroupSkeleton from "@/components/ui/GroupSkeleton";
import Toast from "@/components/ui/toast";

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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
        setToast("Group created 🎉");
        setName("");
        fetchGroups();

      } else {
        setToast("Failed to create group ❌");
      }
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("Something went wrong ❌");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24">

      {/* Create Group */}
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Create new group"
        />
        <button
          onClick={createGroup}
          disabled={creating}
          className={`px-4 rounded text-white ${creating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
            }`}
        >
          {creating ? "Creating..." : "Add"}
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
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold">No groups yet</h2>
          <p className="text-gray-500 text-sm">
            Create your first group to get started
          </p>
        </div>
      )}

      {/* =========================
          GROUP LIST
         ========================= */}
      {!loading && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                setSelectedGroupId(g.id);
                localStorage.setItem("selectedGroupId", g.id);
              }}
              className={`p-4 border rounded-xl cursor-pointer transition ${selectedGroupId === g.id
                ? "border-green-500 bg-green-50"
                : ""
                }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{g.name}</p>

                  <p className="text-sm text-gray-500">
                    {g.members?.length || 0} members
                  </p>

                  <p className="text-sm mt-1 text-green-600">
                    ₹
                    {g.expenses?.reduce(
                      (sum: number, e: any) => sum + e.amount,
                      0
                    ) || 0}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/groups/${g.id}`);
                  }}
                  className="text-green-600 text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* TOAST */}
      {toast && <Toast message={toast} />}
    </div>
  );
}