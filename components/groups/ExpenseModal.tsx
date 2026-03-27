"use client";

import { useState } from "react";

export default function AddExpenseModal({
  group,
  onClose,
  onSuccess,
}: any) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [splitType, setSplitType] = useState("equal");

  const submit = async () => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        description,
        amount: Number(amount),
        groupId: group.id,
        payerId,
        splitType,
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* MODAL */}
      <div className="bg-white rounded-2xl w-[360px] p-6 shadow-2xl animate-fadeIn">
        {/* TITLE */}
        <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

        {/* INPUTS */}
        <div className="space-y-3">
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          {/* 🔥 CUSTOM DROPDOWN - PAYER */}
          <div className="relative">
            <select
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full appearance-none border rounded-lg p-3 pr-10 bg-white focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="">Select payer</option>
              {group.members.map((m: any) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name || m.user.email}
                </option>
              ))}
            </select>

            {/* custom arrow */}
            <span className="absolute right-3 top-3 text-gray-400">
              ▼
            </span>
          </div>

          {/* 🔥 CUSTOM DROPDOWN - SPLIT */}
          <div className="relative">
            <select
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
              className="w-full appearance-none border rounded-lg p-3 pr-10 bg-white focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="equal">Equal</option>
              <option value="custom">Custom</option>
            </select>

            <span className="absolute right-3 top-3 text-gray-400">
              ▼
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}