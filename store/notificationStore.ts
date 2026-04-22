import { NotificationState } from "@/types";
import { create } from "zustand";

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  count: 0,
  lastFetched: 0,

  setNotifications: (data) =>
    set(() => ({
      notifications: data,
      lastFetched: Date.now(),
    })),

  setCount: (count) => set(() => ({ count })),

  // 🔥 Optimistic update
  markAllReadOptimistic: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
      })),
      count: 0,
    })),
}));
