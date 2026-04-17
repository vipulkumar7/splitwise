import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

const CACHE_TIME = 10000; // 10 sec

export function useNotifications() {
  const { notifications, count, setNotifications, setCount, lastFetched } =
    useNotificationStore();

  const fetchNotifications = async (force = false) => {
    const now = Date.now();

    // 🔥 Cache check
    if (!force && now - lastFetched < CACHE_TIME) return;

    try {
      const [notifRes, countRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/unread"),
      ]);

      const notificationsData = await notifRes.json();
      const countData = await countRes.json();

      setNotifications(notificationsData);
      setCount(countData.count ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Smart polling
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    count,
    fetchNotifications,
  };
}
