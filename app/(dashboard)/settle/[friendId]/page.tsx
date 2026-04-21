"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function SettlePage() {
  const router = useRouter();
  const params = useParams();

  const friendId = params.friendId as string;

  const [amount, setAmount] = useState<number>(0);
  const [upiId, setUpiId] = useState("");

  const handleUPIPay = () => {
    const url = `upi://pay?pa=${upiId}&pn=Friend&am=${amount}&cu=INR`;
    window.location.href = url;
  };

  const handleConfirm = async () => {
    await fetch("/api/settle", {
      method: "POST",
      body: JSON.stringify({
        friendId,
        amount,
      }),
    });

    router.push("/friends");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">Settle Payment</h1>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 rounded bg-white/10"
        />

        <input
          type="text"
          placeholder="UPI ID (e.g. vipul@upi)"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full p-3 rounded bg-white/10"
        />

        <button
          onClick={handleUPIPay}
          className="w-full bg-green-500 py-3 rounded cursor-pointer hover:bg-green-600 active:scale-95 transition"
        >
          Pay via UPI
        </button>

        <button
          onClick={handleConfirm}
          className="w-full bg-blue-500 py-3 rounded"
        >
          I’ve Paid ✅
        </button>
      </div>
    </div>
  );
}
