"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { UPI_APPS, UPIApp } from "./constants";
import { isValidUPI, buildUPIParams, getUPIUrl } from "./utils";

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

  // 🔥 Open Specific UPI App
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

  // 🔥 Open ANY UPI APP (intent picker)
  const openAnyUPI = () => {
    if (!isMobile) return showToast("Use mobile 📱");
    if (!isValid) return showToast("Invalid details");

    const params = buildUPIParams(upiId, amount);
    window.location.href = `upi://pay?${params}`;
  };

  // ✅ Confirm settlement
  const handleConfirm = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      await fetch("/api/settle", {
        method: "POST",
        body: JSON.stringify({
          friendId,
          amount: Number(amount),
        }),
      });

      showToast("Settled 🎉");
      setTimeout(() => router.push("/friends"), 1200);
    } catch {
      showToast("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] text-white px-4"
      style={{ paddingTop: "140px" }}
    >
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
        <h1 className="text-xl font-semibold text-center mb-4">
          Settle Payment 💸
        </h1>

        {/* Amount */}
        <input
          value={amount}
          onChange={(e) => {
            const val = e.target.value.replace(/^0+/, "");
            if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
          }}
          placeholder="₹ Enter amount"
          className="w-full p-4 rounded-xl text-black outline-none focus:ring-2 focus:ring-blue-500 mt-2 mb-2"
        />

        {/* UPI */}
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value.toLowerCase())}
          placeholder="Enter UPI ID"
          className="w-full p-4 text-black rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mt-2 mb-2"
        />

        {/* Apps */}
        <div className="grid grid-cols-3 gap-4 flex justify-around items-center mt-2">
          {UPI_APPS.map((app) => (
            <button
              key={app.key}
              onClick={() => openApp(app.key as UPIApp)}
              disabled={!isValid || selectedApp !== null}
              className={`p-4 rounded-2xl bg-white/10 transition ${
                selectedApp === app.key
                  ? "bg-white/20 scale-105"
                  : "bg-white/10 hover:bg-white/20"
              } disabled:opacity-40`}
            >
              <Image
                src={app.icon}
                alt=""
                width={32}
                height={32}
                className="mx-auto"
              />
              <p className="text-xs mt-2">{app.name}</p>
            </button>
          ))}
        </div>

        {/* 🔥 Other UPI Button */}
        <button
          onClick={openAnyUPI}
          disabled={!isValid}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-40 mt-4 mb-4"
        >
          Other UPI Apps
        </button>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!isValid || loading}
          className="w-full bg-blue-500 py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "I’ve Paid ✅"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
