"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Add Member
  const [memberEmail, setMemberEmail] = useState("");

  // =========================
  // FETCH GROUPS
  // =========================
  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data || []);
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
    if (!name.trim()) return;

    await fetch("/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchGroups();
  };

  // =========================
  // ADD MEMBER
  // =========================
  const addMember = async () => {
    if (!memberEmail || !selectedGroupId) return;

    const res = await fetch("/api/groups/add-member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: memberEmail,
        groupId: selectedGroupId,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert("Member added!");
    }

    setMemberEmail("");
  };

  // =========================
  // ADD EXPENSE
  // =========================
  const addExpense = async () => {
    if (!amount || !selectedGroupId) return;

    await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        amount: Number(amount),
        groupId: selectedGroupId,
      }),
    });

    setShowExpenseModal(false);
    setAmount("");
    setDescription("");

    fetchGroups();
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      {/* Header */}
      {/* <h1 className="text-2xl font-bold mb-4">Splitwise</h1> */}

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
          className="bg-green-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Groups List */}
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

                {/* Total Amount */}
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

      {/* Add Member */}
      {/* {selectedGroupId && (
        <div className="mt-4 flex gap-2">
          <input
            placeholder="Enter email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={addMember}
            className="bg-blue-500 text-white px-3 rounded"
          >
            Add
          </button>
        </div>
      )} */}

      {/* Floating Button */}
      {/* <button
        onClick={() => {
          if (!selectedGroupId) {
            alert("Select a group first");
            return;
          }
          setShowExpenseModal(true);
        }}
        className="fixed bottom-20 right-6 bg-green-500 text-white w-14 h-14 rounded-full text-2xl shadow-lg"
      >
        +
      </button> */}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-[300px] space-y-3">
            <h2 className="font-semibold text-lg">Add Expense</h2>

            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 w-full"
            />

            <div className="flex justify-between">
              <button onClick={() => setShowExpenseModal(false)}>
                Cancel
              </button>

              <button
                onClick={addExpense}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}