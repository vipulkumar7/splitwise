"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";

type UPIApp = "gpay" | "phonepe" | "paytm";

export default function SettlePage() {
  const router = useRouter();
  const params = useParams();
  const friendId = params.friendId as string;

  const [amount, setAmount] = useState<string>("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<UPIApp | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const UPI_APPS: {
    key: UPIApp;
    name: string;
    icon: string;
    color: string;
  }[] = [
    { key: "gpay", name: "GPay", icon: "/icons/gpay.png", color: "blue" },
    {
      key: "phonepe",
      name: "PhonePe",
      icon: "/icons/phonepe.png",
      color: "purple",
    },
    { key: "paytm", name: "Paytm", icon: "/icons/paytm.png", color: "cyan" },
  ];

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
  }, []);

  const isValidUPI = (upi: string) => {
    const regex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!regex.test(upi)) return false;
    if (upi.includes("@gmail") || upi.includes("@yahoo")) return false;
    return true;
  };

  const isValid = useMemo(() => {
    return Number(amount) > 0 && isValidUPI(upiId);
  }, [amount, upiId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const buildParams = () => {
    const txnRef = `TXN${Date.now()}`;

    return `pa=${upiId}&pn=${encodeURIComponent(
      "Friend",
    )}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      "Split Payment",
    )}&tr=${txnRef}`;
  };

  // 🚀 MAIN FUNCTION
  const openApp = (app: UPIApp) => {
    if (!isMobile) {
      showToast("Use mobile device 📱");
      return;
    }

    if (!isValid) {
      showToast("Enter valid details");
      return;
    }

    const params = buildParams();
    const fallback = `upi://pay?${params}`;

    let url = "";

    switch (app) {
      case "gpay":
        url = `tez://upi/pay?${params}`;
        break;
      case "phonepe":
        url = `phonepe://pay?${params}`;
        break;
      case "paytm":
        url = `paytmmp://pay?${params}`;
        break;
    }

    setSelectedApp(app);

    // Try direct open
    window.location.href = url;

    // Fallback (important)
    setTimeout(() => {
      window.location.href = fallback;
    }, 1200);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white px-4">
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl space-y-6">
          <h1 className="text-2xl font-semibold">Settle Payment 💸</h1>

          {/* Amount */}
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
            className="w-full p-4 rounded-xl bg-white/10 border border-white/10 focus:ring-2 focus:ring-green-500"
          />

          {/* UPI */}
          <input
            type="text"
            placeholder="Enter UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value.toLowerCase())}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/10 focus:ring-2 focus:ring-blue-500"
          />

          {/* Apps */}
          <div className="grid grid-cols-3 gap-4">
            {UPI_APPS.map((app) => (
              <button
                key={app.key}
                onClick={() => openApp(app.key)}
                disabled={!isValid}
                className={`group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl 
                  transition-all duration-300 min-h-[100px]
                  ${
                    selectedApp === app.key
                      ? "bg-white/20 scale-105 shadow-lg"
                      : "bg-white/10 hover:bg-white/10"
                  } disabled:opacity-40`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                <span className="text-xs text-white/90">{app.name}</span>
              </button>
            ))}
          </div>

          {/* Fallback */}
          <button
            onClick={() => {
              window.location.href = `upi://pay?${buildParams()}`;
            }}
            disabled={!isValid}
            className="w-full bg-green-500 py-3 rounded-xl"
          >
            Other UPI Apps
          </button>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className="w-full bg-blue-500 py-3 rounded-xl"
          >
            {loading ? "Processing..." : "I’ve Paid ✅"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
