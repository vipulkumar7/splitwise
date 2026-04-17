"use client";

import { useState, useRef, useEffect } from "react";
import { IoNotifications } from "react-icons/io5";
import { useNotificationStore } from "@/store/notificationStore";
import { useNotifications } from "../hooks/useNotifications";
import { getNotificationUI } from "./getNotificationUI";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const ref = useRef<HTMLDivElement>(null);

  const { notifications, count, fetchNotifications } = useNotifications();
  const { markAllReadOptimistic } = useNotificationStore();

  const handleToggle = () => {
    if (!open) calculatePosition();
    setOpen((prev) => !prev);
  };

  // 📍 Calculate dynamic position
  const calculatePosition = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const isMobile = window.innerWidth < 640;

    setDropdownPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right - (isMobile ? 8 : 0), // 👈 shift right on mobile
    });
  };

  // 📥 Mark read
  const handleOpenLogic = async () => {
    markAllReadOptimistic();

    try {
      await fetch("/api/notifications/read", {
        method: "POST",
      });
    } catch (err) {
      console.error(err);
    }

    fetchNotifications(true);
  };

  // ❌ Close outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔁 Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      if (open) calculatePosition();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  return (
    <div className="relative flex items-center" ref={ref}>
      {/* 🔔 Bell */}
      <button
        onClick={() => {
          handleToggle();
          handleOpenLogic();
        }}
        className="relative p-2 rounded-full hover:bg-white/10 transition"
      >
        <IoNotifications className="text-2xl text-white" />

        {count > 0 && (
          <span
            className="
              absolute
              top-0 right-0
              translate-x-1/3 -translate-y-1/3
              min-w-[18px] h-[18px]
              flex items-center justify-center
              bg-red-500 text-white
              text-[10px] font-semibold
              rounded-full shadow p-1
              h-4 w-4
            "
          >
            {count}
          </span>
        )}
      </button>

      {/* 🔥 DROPDOWN */}
      {open && (
        <div
          style={{
            top: dropdownPos.top,
            right: dropdownPos.right - 45,
            height: "400px",
          }}
          className="
            fixed
            w-[340px] sm:w-[360px] max-w-[95vw]
            h-[420px] sm:h-[460px]
            bg-zinc-950
            rounded-2xl
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.9)]
            z-[999]
            overflow-y-auto no-scrollbar
          "
        >
          {/* Header */}
          <div className="px-4 py-3 font-semibold text-white border-b border-white/10 shrink-0">
            Notifications
          </div>

          {/* ✅ SCROLL AREA (THIS WILL WORK NOW) */}
          <div className="flex-1">
            {notifications.map((n) => {
              const { icon, color } = getNotificationUI(n as any);

              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-white/10"
                >
                  <div className="text-lg mt-1">{icon}</div>

                  <div className="flex-1">
                    <p className={`text-sm ${color}`}>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
