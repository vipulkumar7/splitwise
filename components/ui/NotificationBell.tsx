"use client";

import { useEffect, useRef, useState } from "react";
import { IoNotifications } from "react-icons/io5";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [count, setCount] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  // =========================
  // FETCH UNREAD COUNT
  // =========================
  const fetchCount = async () => {
    const res = await fetch("/api/notifications/unread");
    const data = await res.json();
    setCount(data.count || 0);
  };

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data || []);
  };

  // =========================
  // OPEN DROPDOWN
  // =========================
  const handleOpen = async () => {
    setOpen(!open);

    if (!open) {
      await fetchNotifications();

      // ✅ mark as read
      await fetch("/api/notifications/read", {
        method: "POST",
      });

      setCount(0);
    }
  };

  // =========================
  // CLOSE ON OUTSIDE CLICK
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // LOAD COUNT
  // =========================
  useEffect(() => {
    fetchCount();
  }, []);

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
        <div className="absolute -left-40 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50">
          <div className="p-3 font-semibold border-b">Notifications</div>

          <div className="max-h-80 overflow-y-auto no-scrollbar scroll-smooth">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm border-b cursor-pointer ${
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
