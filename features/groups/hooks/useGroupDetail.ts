"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export const useGroupDetail = (groupId: string) => {
  const shouldFetch = !!groupId;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/groups/${groupId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      keepPreviousData: true,
    },
  );

  return {
    group: data || null,
    loading: isLoading,
    mutate, // 🔥 use everywhere
    error,
  };
};
