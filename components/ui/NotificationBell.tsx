"use client";

import { useEffect, useState } from "react";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/api/notifications")
            .then((res) => res.json())
            .then((data) => setNotifications(data));
    }, []);

    return (
        <div className="relative">
            {/* Bell */}
            <button onClick={() => setOpen(!open)} className="relative">
                🔔
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow rounded p-2">
                    {notifications.length === 0 && <p>No notifications</p>}

                    {notifications.map((n) => (
                        <div key={n.id} className="text-sm border-b py-1">
                            {n.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}