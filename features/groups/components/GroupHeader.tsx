"use client";

import AvatarGroup from "@/components/ui/AvatarGroup";
import { useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function GroupHeader({
    groupName,
    onMenuClick,
    groupMembers,
    buttonRef
}: {
    groupName: string;
    onMenuClick: () => void;
    groupMembers: any[];
    buttonRef: any
}) {

    return (
        <div className="m-2">
            <div className="flex justify-between items-center relative">
                <h1 className="text-2xl font-bold text-white">
                    {groupName}
                </h1>

                <button
                    ref={buttonRef}
                    onClick={onMenuClick}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <BsThreeDotsVertical />
                </button>
            </div>
            <AvatarGroup members={groupMembers} />
        </div>
    );
}