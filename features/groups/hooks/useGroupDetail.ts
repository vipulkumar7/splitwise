"use client";

import { useEffect, useState } from "react";

export const useGroupDetail = (groupId: string) => {
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroup = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await fetch(`/api/groups/${groupId}`);

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            setGroup(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroup(true);
    }, [groupId]);

    return {
        group,
        loading,
        refreshing,
        fetchGroup,
    };
};