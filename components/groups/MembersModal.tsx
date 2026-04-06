"use client";

import { FiX } from "react-icons/fi";

export default function MembersModal({
    show,
    onClose,
    members,
    currentUserId, // Replace with actual current user ID
}: {
    show: boolean;
    onClose: () => void;
    members: any[];
    currentUserId?: string;
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[80%] max-w-md rounded-2xl p-5 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Members</h2>
                    <button onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {members.map((m: any) => {
                        const user = m?.user;
                        const name = user?.name || user?.email || "User";
                        const isYou = user?.id === currentUserId; // Replace with actual current user ID

                        return (
                            <div
                                key={user?.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                                    {name.charAt(0).toUpperCase()}
                                </div>

                                {/* Name */}
                                <span className="text-sm font-medium">{isYou ? "You" : name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}