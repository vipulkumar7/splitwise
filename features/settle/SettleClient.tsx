"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { mutate } from "swr";
import { isValidUPI, buildUPIParams, getUPIUrl } from "./utils";
import { IFriend } from "@/types";
import { UPI_APPS, UPIApp } from "./constants";

export default function SettleClient({ friendId }: { friendId: string }) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<UPIApp | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent);

  const isValid = Number(amount) > 0 && isValidUPI(upiId);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 🔥 Optimistic balance update
  const updateBalanceOptimistically = (
    friends: IFriend[],
    friendId: string,
    amount: number,
  ) => {
    return friends.map((f) => {
      if (f.id !== friendId) return f;

      return {
        ...f,
        balance: Number((f.balance - amount).toFixed(2)),
      };
    });
  };

  // 🔥 Open specific UPI app
  const openApp = (app: UPIApp) => {
    if (!isMobile) return showToast("Use mobile 📱");
    if (!isValid) return showToast("Invalid details");
    if (selectedApp) return;

    const params = buildUPIParams(upiId, amount);
    const fallback = `upi://pay?${params}`;
    const url = getUPIUrl(app, params);

    setSelectedApp(app);

    window.location.href = url;

    setTimeout(() => {
      window.location.href = fallback;
    }, 1200);
  };

  // 🔥 Open any UPI app
  const openAnyUPI = () => {
    if (!isMobile) return showToast("Use mobile 📱");
    if (!isValid) return showToast("Invalid details");

    const params = buildUPIParams(upiId, amount);
    window.location.href = `upi://pay?${params}`;
  };

  // ✅ Confirm settlement (OPTIMISTIC + SWR)
  const handleConfirm = async () => {
    if (!isValid || loading) return;

    const amt = Number(amount);

    try {
      setLoading(true);

      // ⚡ OPTIMISTIC UPDATE (instant UI)
      await mutate(
        "/api/friends",
        (current: IFriend[] = []) =>
          updateBalanceOptimistically(current, friendId, amt),
        false,
      );

      // 🔁 API CALL
      const res = await fetch("/api/settle", {
        method: "POST",
        body: JSON.stringify({
          friendId,
          amount: amt,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      // 🔄 Revalidate (sync with backend)
      mutate("/api/friends");

      showToast("Settled 🎉");

      // 🔁 Reset state (clean UX)
      setAmount("");
      setUpiId("");
      setSelectedApp(null);

      setTimeout(() => router.push("/friends"), 800);
    } catch (err) {
      console.error(err);

      // 🔙 Rollback
      mutate("/api/friends");

      showToast("Error occurred ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6 text-white">
      {/* CARD */}
      <div className="w-full max-w-md rounded-2xl p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
        {/* HEADER */}
        <h1 className="text-xl font-semibold text-center mb-6 tracking-wide">
          Settle Payment 💸
        </h1>

        {/* AMOUNT */}
        <input
          value={amount}
          onChange={(e) => {
            const val = e.target.value.replace(/^0+/, "");
            if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
          }}
          placeholder="₹ Enter amount"
          className="w-full p-4 rounded-xl bg-white/90 text-black outline-none focus:ring-2 focus:ring-green-500 transition"
        />

        {/* UPI */}
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value.toLowerCase())}
          placeholder="Enter UPI ID"
          className="w-full mt-4 p-4 rounded-xl bg-white/90 text-black outline-none focus:ring-2 focus:ring-green-500 transition"
        />

        {/* UPI APPS */}
        <div className="grid grid-cols-3 gap-4 flex justify-between items-center mt-6">
          {UPI_APPS.map((app) => (
            <button
              key={app.key}
              onClick={() => openApp(app.key as UPIApp)}
              disabled={!isValid || selectedApp !== null}
              className={`p-4 rounded-2xl border border-white/10 transition-all duration-200
                ${
                  selectedApp === app.key
                    ? "bg-white scale-105 shadow-lg"
                    : "bg-white hover:bg-white/20 hover:scale-[1.05]"
                }
                disabled:opacity-40`}
            >
              <Image
                src={app.icon}
                alt=""
                width={34}
                height={34}
                className="mx-auto"
              />
              <p className="text-sm text-black mt-2">{app.name}</p>
            </button>
          ))}
        </div>

        {/* OTHER UPI */}
        <button
          onClick={openAnyUPI}
          disabled={!isValid}
          className="w-full mt-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-white/20 transition disabled:opacity-40"
        >
          Other UPI Apps
        </button>

        {/* CONFIRM */}
        <button
          onClick={handleConfirm}
          disabled={!isValid || loading}
          className="w-full mt-4 py-3 rounded-xl font-semibold bg-green-500 text-white hover:opacity-90 transition shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "I’ve Paid ✅"}
        </button>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
