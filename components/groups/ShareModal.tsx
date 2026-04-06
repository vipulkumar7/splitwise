"use client";

import { m } from "framer-motion";
import { useState } from "react";
import {
    FaWhatsapp,
    FaCopy,
    FaEnvelope,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function ShareModal({
    show,
    onClose,
    groupId,
    groupName,
    setToast,
}: any) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    if (!show) return null;

    // =========================
    // API
    // =========================
    const getLink = async () => {
        const res = await fetch("/api/groups/invite-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ groupId }),
        });

        const data = await res.json();
        return data.inviteLink;
    };

    // =========================
    // ACTIONS
    // =========================
    const handleCopy = async () => {
        try {
            setLoading(true);
            const link = await getLink();
            await navigator.clipboard.writeText(link);

            setToast({ message: "Link copied ✅", type: "success" });
            onClose();
        } catch {
            setToast({ message: "Failed ❌", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = async () => {
        const link = await getLink();
        const message = `Join my group "${groupName}" 💸\n${link}`;

        window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        onClose();
    };

    const handleEmail = async () => {
        if (!email || loading) return;

        try {
            setLoading(true);

            await fetch("/api/groups/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, groupId }),
            });

            setToast({ message: "Invite sent ✅", type: "success" });
            setEmail("");
            onClose();
        } catch {
            setToast({ message: "Failed ❌", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UI
    // =========================
    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white w-[340px] rounded-2xl p-5 shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Share Group</h2>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* OPTIONS */}
                <div className="space-y-3">

                    {/* WHATSAPP */}
                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-green-50 transition"
                    >
                        <FaWhatsapp className="text-green-500 text-xl" />
                        <span className="font-medium">Share on WhatsApp</span>
                    </button>

                    {/* COPY */}
                    <button
                        onClick={handleCopy}
                        disabled={loading}
                        className="flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-gray-100 transition"
                    >
                        <FaCopy className="text-gray-700 text-lg" />
                        <span className="font-medium">
                            {loading ? "Copying..." : "Copy Link"}
                        </span>
                    </button>

                    {/* EMAIL */}
                    <div className="flex gap-2 mt-2">
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={handleEmail}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-xl flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaEnvelope />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}