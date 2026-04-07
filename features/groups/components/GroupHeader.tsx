"use client";

import AvatarGroup from "@/components/ui/AvatarGroup";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function GroupHeader({
    groupName,
    onMenuClick,
    groupMembers
}: {
    groupName: string;
    onMenuClick: () => void;
    groupMembers: any[];
}) {
    return (
        <div className="m-2">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {groupName}
                </h1>

                <button
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