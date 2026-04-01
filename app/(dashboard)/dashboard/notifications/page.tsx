"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();

        // ✅ mark all as read
        fetch("/api/notifications/read", {
            method: "POST",
        });
    }, []);

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Notifications</h1>

            {notifications.length === 0 && (
                <p className="text-gray-500">No notifications</p>
            )}

            <div className="space-y-2">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-3 border rounded ${!n.read ? "bg-blue-50" : ""
                            }`}
                    >
                        <p>{n.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}