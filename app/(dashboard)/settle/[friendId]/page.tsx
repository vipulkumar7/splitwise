"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function SettlePage() {
  const router = useRouter();
  const params = useParams();
  const friendId = params.friendId as string;

  const [amount, setAmount] = useState<string>("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 📱 Mobile detection
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
  }, []);

  // ✅ UPI validation
  const isValidUPI = (upi: string) => {
    const regex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!regex.test(upi)) return false;
    if (upi.includes("@gmail") || upi.includes("@yahoo")) return false;
    return true;
  };

  const isValid = useMemo(() => {
    return Number(amount) > 0 && isValidUPI(upiId);
  }, [amount, upiId]);

  // 🔔 Toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 🔥 Build UPI params
  const buildParams = () => {
    const txnRef = `TXN${Date.now()}`;
    return `pa=${upiId}&pn=Friend&am=${Number(amount).toFixed(
      2,
    )}&cu=INR&tn=Split&tr=${txnRef}`;
  };

  // 🚀 Open app
  const openApp = (scheme: string, app: string) => {
    if (!isMobile) {
      showToast("Use mobile device 📱");
      return;
    }

    if (!isValid) {
      showToast("Enter valid details");
      return;
    }

    setSelectedApp(app);
    window.location.href = `${scheme}?${buildParams()}`;
  };

  // ✅ Confirm payment
  const handleConfirm = async () => {
    if (!isValid) {
      showToast("Invalid details");
      return;
    }

    try {
      setLoading(true);

      await fetch("/api/settle", {
        method: "POST",
        body: JSON.stringify({
          friendId,
          amount: Number(amount),
        }),
      });

      showToast("Settled successfully 🎉");
      setTimeout(() => router.push("/friends"), 1200);
    } catch {
      showToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white relative overflow-hidden px-4">
      {/* Glow */}
      <div className="absolute w-[500px] h-[500px] bg-green-500/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl space-y-6 z-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settle Payment 💸
          </h1>

          {/* 💰 Amount */}
          <input
            type="text"
            inputMode="decimal"
            placeholder="₹ Enter amount"
            value={amount}
            onChange={(e) => {
              let val = e.target.value;

              if (val.length > 1 && val.startsWith("0")) {
                val = val.replace(/^0+/, "");
              }

              if (/^\d*\.?\d{0,2}$/.test(val)) {
                setAmount(val);
              }
            }}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/10 focus:ring-2 focus:ring-green-500 outline-none text-lg"
          />

          {/* 🏦 UPI */}
          <input
            type="text"
            placeholder="Enter UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value.toLowerCase())}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          />

          {/* ⚡ UPI Apps */}
          <div className="grid grid-cols-3 gap-4">
            {/* GPay */}
            <button
              onClick={() => openApp("tez://upi/pay", "GPay")}
              disabled={!isValid}
              className={`group flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                selectedApp === "GPay"
                  ? "bg-white/20 scale-105 shadow-lg"
                  : "bg-white/10 hover:bg-white/500"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Image src="/icons/gpay.png" alt="GPay" width={32} height={32} />
              <span className="text-xs text-white">GPay</span>
            </button>

            {/* PhonePe */}
            <button
              onClick={() => openApp("phonepe://pay", "PhonePe")}
              disabled={!isValid}
              className={`group flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                selectedApp === "PhonePe"
                  ? "bg-white/20 scale-105 shadow-lg"
                  : "bg-white/10 hover:bg-white/500"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Image
                src="/icons/phonepe.png"
                alt="PhonePe"
                width={32}
                height={32}
              />
              <span className="text-xs text-white">PhonePe</span>
            </button>

            {/* Paytm */}
            <button
              onClick={() => openApp("paytmmp://pay", "Paytm")}
              disabled={!isValid}
              className={`group flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                selectedApp === "Paytm"
                  ? "bg-white/20 scale-105 shadow-lg"
                  : "bg-white/10 hover:bg-white/500"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Image
                src="/icons/paytm.png"
                alt="Paytm"
                width={32}
                height={32}
              />
              <span className="text-xs text-white">Paytm</span>
            </button>
          </div>

          {/* 🔁 Fallback */}
          <button
            onClick={() => openApp("upi://pay", "Other")}
            disabled={!isValid}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 transition disabled:opacity-40"
          >
            Other UPI Apps
          </button>

          {/* ✅ Confirm */}
          <button
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className={`w-full py-3 rounded-xl transition ${
              loading
                ? "bg-blue-500/50"
                : "bg-blue-500 hover:bg-blue-600 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "I’ve Paid ✅"}
          </button>
        </div>
      </div>
      {/* 🔔 Toast */}
      {toast && (
        <div className="absolute bottom-6 bg-white text-black px-4 py-2 rounded-xl shadow-lg animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
