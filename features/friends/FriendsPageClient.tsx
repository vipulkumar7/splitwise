"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

import SummaryCard from "./SummaryCard";
import FriendCard from "./FriendCard";
import Input from "@/components/ui/form/Input";
import FriendsPageSkeleton from "@/components/ui/FriendsPageSkeleton";

import { IFriend } from "@/types";

// =========================
// 🔥 FETCHER (SAFE)
// =========================
const fetcher = async (url: string): Promise<IFriend[]> => {
  const res = await fetch(url);
  const data = await res.json();

  // ✅ Always normalize response
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.friends)) return data.friends;

  return [];
};

export default function FriendsPageClient({
  fallbackData,
}: {
  fallbackData?: IFriend[];
}) {
  const [query, setQuery] = useState("");

  // =========================
  // 📡 SWR
  // =========================
  const { data, isLoading } = useSWR<IFriend[]>("/api/friends", fetcher, {
    fallbackData,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true, // 🔥 important
  });

  // ✅ Always safe array
  const friends: IFriend[] = Array.isArray(data) ? data : [];

  // =========================
  // 🔍 FILTER
  // =========================
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return friends; // 🚀 skip filtering

    return friends.filter((f) => {
      const name = f.name || f.email || "";
      return name.toLowerCase().includes(q);
    });
  }, [friends, query]);

  // =========================
  // 💰 TOTALS
  // =========================
  const totals = useMemo(() => {
    return friends.reduce(
      (acc, f) => {
        if (typeof f.balance !== "number") return acc;

        if (f.balance < 0) acc.owe += Math.abs(f.balance);
        else acc.owed += f.balance;

        return acc;
      },
      { owe: 0, owed: 0 },
    );
  }, [friends]);

  const net = totals.owed - totals.owe;

  if (isLoading && !friends.length) {
    return <FriendsPageSkeleton />;
  }

  return (
    <div className="h-full w-full max-w-md mx-auto text-white px-4 py-6 flex flex-col min-h-0">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          Friends 👥
        </h1>
        <p className="text-gray-400 text-sm">
          Track balances with your friends
        </p>
      </div>

      {/* SUMMARY */}
      <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 w-full mt-4 mb-2">
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

      {/* SEARCH */}
      <Input
        name="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search friends..."
        className="text-white w-full pl-10 pr-4 py-3 mt-2 mb-2 rounded-xl 
        bg-zinc-950 border border-white/10 backdrop-blur-xl 
        focus:outline-none focus:ring-2 focus:ring-green-500 
        transition-all duration-300"
      />

      {/* LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-4 pr-1 space-y-3 no-scrollbar">
        {friends.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No friends yet 👥</p>
            <p className="text-xs mt-1">Start by splitting expenses</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No results found 🔍</p>
          </div>
        ) : (
          filtered.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))
        )}
      </div>
    </div>
  );
}
