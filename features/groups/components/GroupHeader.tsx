"use client";

import AvatarGroup from "@/components/ui/AvatarGroup";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RefObject, memo } from "react";

interface IUser {
  id: string;
  name?: string;
  email?: string;
}

interface IGroupMember {
  user: IUser;
}

interface IGroupHeaderProps {
  groupName: string;
  onMenuClick: () => void;
  groupMembers: IGroupMember[];
  buttonRef?: RefObject<HTMLButtonElement>;
}

function GroupHeader({
  groupName,
  onMenuClick,
  groupMembers,
  buttonRef,
}: IGroupHeaderProps) {
  return (
    <div className="m-2">
      <div className="flex justify-between items-center relative">
        {/* TITLE */}
        <h1 className="text-xl font-semibold text-white truncate">
          {groupName}
        </h1>

        {/* MENU BUTTON */}
        <button
          ref={buttonRef}
          onClick={onMenuClick}
          aria-label="Open menu"
          className="p-2 rounded-full hover:bg-gray-800 transition"
        >
          <BsThreeDotsVertical size={18} />
        </button>
      </div>

      {/* MEMBERS */}
      <AvatarGroup members={groupMembers} />
    </div>
  );
}

export default memo(GroupHeader);
