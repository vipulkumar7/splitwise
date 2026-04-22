"use client";

import { useState } from "react";
import DetailRow from "./DetailRow";
import { IProfile } from "@/types/models/profile";

export default function ProfileClient({ user }: IProfile) {
  const [loading, setLoading] = useState(false);

  //   const handleClick = () => {
  //     if (loading) return;
  //     setLoading(true);

  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 800);
  //   };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* PROFILE CARD */}
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt="profile"
                className="w-20 h-20 rounded-full border border-white/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                {user.name?.[0] || user.email?.[0]}
              </div>
            )}

            <div>
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-6 border-t border-white/10" />

          {/* DETAILS */}
          <div className="space-y-3">
            <DetailRow label="Name" value={user.name} />
            <DetailRow label="Email" value={user.email} />
          </div>

          {/* ACTION */}
          <div className="mt-6">
            <button
              //   onClick={handleClick}
              disabled={loading}
              className={`w-full py-2 rounded-lg font-medium transition shadow-sm disabled:cursor-not-allowed
                ${
                  loading
                    ? "bg-green-500/60 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 active:scale-95"
                }`}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 text-sm text-gray-400 text-center">
          More features coming soon 🚀
        </div>
      </div>
    </div>
  );
}
