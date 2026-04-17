"use client";

import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

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
