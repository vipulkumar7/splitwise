"use client";

import useSWR from "swr";

// ✅ reusable fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export const useGroupDetail = (groupId: string) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    groupId ? `/api/groups/${groupId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  return {
    group: data || null,
    loading: isLoading,
    refreshing: isValidating,
    fetchGroup: mutate, // 🔥 replaces your fetchGroup
    error,
  };
};
