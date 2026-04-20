"use client";

import { useMemo, useState } from "react";
import SummaryCard from "./SummaryCard";
import FriendCard from "./FriendCard";
import { FiSearch } from "react-icons/fi";
import Input from "@/components/ui/form/Input";

interface IFriend {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export default function FriendsPageClient({ friends }: { friends: IFriend[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return friends.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [friends, query]);

  const totals = useMemo(() => {
    let owe = 0;
    let owed = 0;

    friends.forEach((f) => {
      if (f.balance < 0) owe += Math.abs(f.balance);
      else owed += f.balance;
    });

    return { owe, owed, net: owed - owe };
  }, [friends]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <p className="text-gray-400 text-sm mb-6">
          Track balances with your friends
        </p>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <SummaryCard label="You owe" value={totals.owe} type="owe" />
          <SummaryCard label="You are owed" value={totals.owed} type="owed" />
          <SummaryCard label="Net" value={totals.net} type="net" />
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <Input
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-xl bg-white/5 border border-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No friends found 👥
            </div>
          )}

          {filtered.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </div>
    </div>
  );
}
