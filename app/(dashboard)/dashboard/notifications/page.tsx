"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();

        // mark as read
        fetch("/api/notifications/read", { method: "POST" });
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "expense":
                return "💸";
            case "join":
                return "👥";
            case "group":
                return "📁";
            default:
                return "🔔";
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">

            <div className="max-w-xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-semibold">Notifications</h1>

                    <button
                        onClick={() =>
                            fetch("/api/notifications/read", {
                                method: "POST",
                            })
                        }
                        className="text-sm text-green-600 hover:underline"
                    >
                        Mark all as read
                    </button>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-200 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* EMPTY */}
                {!loading && notifications.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        🔔 No notifications yet
                    </div>
                )}

                {/* LIST */}
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`flex gap-3 p-4 rounded-xl border shadow-sm transition hover:shadow-md ${!n.read ? "bg-green-50 border-green-200" : "bg-white"
                                }`}
                        >
                            {/* ICON */}
                            <div className="text-2xl">
                                {getIcon(n.type)}
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    {n.message}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(n.createdAt)}
                                </p>
                            </div>

                            {/* UNREAD DOT */}
                            {!n.read && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}