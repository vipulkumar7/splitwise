"use client";

import { useMemo, useState } from "react";
import SummaryCard from "./SummaryCard";
import FriendCard from "./FriendCard";
import { FiSearch } from "react-icons/fi";
import Input from "@/components/ui/form/Input";
import { IFriend } from "@/types";

export default function FriendsPageClient({ friends }: { friends: IFriend[] }) {
  const [query, setQuery] = useState("");
  // 🔍 Filtered friends (safe + optimized)
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return friends.filter(
      (f) =>
        f && typeof f.balance === "number" && f.name?.toLowerCase().includes(q),
    );
  }, [friends, query]);

  // 💰 Totals calculation (optimized)
  const totals = useMemo(() => {
    return friends.reduce(
      (acc, f) => {
        if (!f || typeof f.balance !== "number") return acc;

        if (f.balance < 0) acc.owe += Math.abs(f.balance);
        else acc.owed += f.balance;

        return acc;
      },
      { owe: 0, owed: 0 },
    );
  }, [friends]);

  const net = totals.owed - totals.owe;

  return (
    <div className="min-h-screen bg-zinc-950 to-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 🔥 HEADER */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight mt-4">
            Friends 👥
          </h1>
          <p className="text-gray-400 text-sm">
            Track balances with your friends
          </p>
        </div>

        {/* 💎 SUMMARY CARDS */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 w-full">
          <div className="min-w-[220px] sm:min-w-0 w-full">
            <SummaryCard label="You owe" value={totals.owe} type="owe" />
          </div>

          <div className="min-w-[220px] sm:min-w-0 w-full">
            <SummaryCard label="You are owed" value={totals.owed} type="owed" />
          </div>

          <div className="min-w-[220px] sm:min-w-0 w-full">
            <SummaryCard label="Net balance" value={net} type="net" />
          </div>
        </div>

        {/* 🔍 SEARCH */}
        <div className="relative group">
          <FiSearch className="absolute top-3.5 left-3 text-gray-400 group-focus-within:text-green-400 transition" />

          <Input
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends..."
            className="text-white w-full pl-10 pr-4 py-3 rounded-xl 
            bg-zinc-950 border border-white/10 backdrop-blur-xl 
            focus:outline-none focus:ring-2 focus:ring-green-500 
            transition-all duration-300"
          />
        </div>

        {/* 📋 LIST */}
        <div className="flex flex-col h-[calc(100vh-260px)]">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
            {filtered.length === 0 ? (
              <div className="text-center text-white py-12 rounded-xl">
                <p className="text-sm">No friends found 👥</p>
              </div>
            ) : (
              filtered.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
