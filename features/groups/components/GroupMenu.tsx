"use client";

import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiUsers, FiShare2, FiLogOut, FiTrash2 } from "react-icons/fi";

export default function GroupMenu({
    show,
    onClose,
    onEditGroup,
    onShare,
    onExit,
    onDelete,
    onMembers,
    anchorRef, // ✅ IMPORTANT
}: any) {
    const ref = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState({
        top: 0,
        left: 0,
    });

    // ✅ Position calculation
    useEffect(() => {
        if (anchorRef?.current && show) {
            const rect = anchorRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + 8,
                left: Math.max(rect.right - 220, 10), // prevent overflow
            });
        }
    }, [anchorRef, show]);

    // ✅ Close on outside click
    useEffect(() => {
        const handleClick = (e: any) => {
            if (!ref.current?.contains(e.target)) {
                onClose();
            }
        };

        if (show) {
            document.addEventListener("mousedown", handleClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [show]);

    if (!show) return null;

    return (
        <div
            ref={ref}
            className="fixed bg-white shadow-xl rounded-xl w-52 z-50 border"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <button
                onClick={onEditGroup}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiEdit2 /> Edit Group Name
            </button>

            <button
                onClick={onMembers}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiUsers /> View Members
            </button>

            <button
                onClick={onShare}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiShare2 /> Share Invite
            </button>

            <button
                onClick={onExit}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiLogOut /> Exit Group
            </button>

            <button
                onClick={onDelete}
                className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-50"
            >
                <FiTrash2 /> Delete Group
            </button>
        </div>
    );
}