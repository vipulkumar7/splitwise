"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import SummaryCard from "./SummaryCard";
import FriendCard from "./FriendCard";
import Input from "@/components/ui/form/Input";
import { IFriend } from "@/types";
import GroupDetailSkeleton from "@/components/ui/GroupDetailSkeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FriendsPageClient({
  fallbackData,
}: {
  fallbackData?: IFriend[];
}) {
  const [query, setQuery] = useState("");

  const { data: friends = [], isLoading } = useSWR("/api/friends", fetcher, {
    fallbackData,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  // 🔍 Filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return friends?.filter((f: IFriend) => f.name?.toLowerCase().includes(q));
  }, [friends, query]);

  // 💰 Totals
  const totals = useMemo(() => {
    return friends.reduce(
      (acc: { owe: number; owed: number }, f: IFriend) => {
        if (f.balance < 0) acc.owe += Math.abs(f.balance);
        else acc.owed += f.balance;
        return acc;
      },
      { owe: 0, owed: 0 },
    );
  }, [friends]);

  const net = totals.owed - totals.owe;

  if (isLoading && !friends.length) {
    return <GroupDetailSkeleton />;
  }

  return (
    <div className="h-full w-full max-w-md mx-auto text-white px-4 py-8">
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
      </div>

      {/* 📋 LIST */}
      <div className="flex flex-col h-[calc(100vh-260px)]">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar mt-4">
          {filtered.length === 0 ? (
            <div className="text-center text-white py-12 rounded-xl">
              <p className="text-sm">No friends found 👥</p>
            </div>
          ) : (
            filtered.map((friend: IFriend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))
          )}
        </div>
      </div>
    </div>
    // </div>
  );
}
