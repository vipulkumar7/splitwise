"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { IoNotifications } from "react-icons/io5";

// =========================
// TYPES
// =========================
interface INotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// =========================
// COMPONENT
// =========================
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [count, setCount] = useState(0);

  const ref = useRef<HTMLDivElement | null>(null);

  // =========================
  // FETCH COUNT
  // =========================
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) throw new Error();

      const data: { count: number } = await res.json();
      setCount(data.count || 0);
    } catch (err) {
      console.error("Count fetch error:", err);
    }
  }, []);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error();

      const data: INotification[] = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  }, []);

  // =========================
  // HANDLE OPEN
  // =========================
  const handleOpen = useCallback(async () => {
    setOpen((prev) => !prev);

    // ✅ only run when opening
    if (!open) {
      await fetchNotifications();

      try {
        await fetch("/api/notifications/read", {
          method: "POST",
        });
      } catch (err) {
        console.error("Mark read error:", err);
      }

      setCount(0);
    }
  }, [open, fetchNotifications]);

  // =========================
  // OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // =========================
  // UI
  // =========================
  return (
    <div className="relative" ref={ref}>
      {/* 🔔 Bell */}
      <button onClick={handleOpen} className="relative text-xl mt-2">
        <IoNotifications />

        {/* Badge */}
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute -left-40 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50">
          <div className="p-3 font-semibold border-b text-black">
            Notifications
          </div>

          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-black">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm border-b cursor-pointer text-black ${
                    !n.read ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  {n.message}

                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
