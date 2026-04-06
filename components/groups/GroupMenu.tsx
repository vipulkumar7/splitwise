"use client";

import { useEffect, useRef } from "react";
import { FiEdit2, FiUsers } from "react-icons/fi";
import { FiShare2 } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

export default function GroupMenu({
    show,
    onClose,
    onEditGroup,
    onShare,
    onExit,
    onDelete,
    onMembers,
}: any) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    if (!show) return null;

    return (
        <div
            ref={ref}
            className="absolute right-4 top-12 bg-white shadow-xl rounded-xl w-52 z-50 border"
        >
            {/* EDIT */}
            <button
                onClick={onEditGroup}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiEdit2 /> Edit Group Name
            </button>

            {/* Memebers */}
            <button
                onClick={onMembers}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiUsers /> View Members
            </button>

            {/* SHARE */}
            <button
                onClick={onShare}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiShare2 /> Share Invite
            </button>

            {/* EXIT */}
            <button
                onClick={onExit}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
            >
                <FiLogOut /> Exit Group
            </button>

            {/* DELETE */}
            <button
                onClick={onDelete}
                className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-gray-100"
            >
                <FiTrash2 /> Delete Group
            </button>
        </div>
    );
}