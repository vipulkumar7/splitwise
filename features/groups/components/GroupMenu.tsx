"use client";

import { IGroupMenuProps, IPosition } from "@/types";
import { useEffect, useRef, useState, RefObject, memo } from "react";
import { FiEdit2, FiUsers, FiShare2, FiLogOut, FiTrash2 } from "react-icons/fi";

function GroupMenu({
  show,
  onClose,
  onEditGroup,
  onShare,
  onExit,
  onDelete,
  onMembers,
  anchorRef,
}: IGroupMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<IPosition>({ top: 0, left: 0 });

  // ✅ Calculate position
  useEffect(() => {
    if (!anchorRef?.current || !show) return;

    const rect = anchorRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,
      left: Math.max(rect.right - 220, 10),
    });
  }, [anchorRef, show]);

  // ✅ Close on outside click
  useEffect(() => {
    if (!show) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show, onClose]);

  if (!show) return null;

  const menuItems = [
    {
      label: "Edit Group Name",
      icon: <FiEdit2 size={16} />,
      onClick: onEditGroup,
    },
    {
      label: "View Members",
      icon: <FiUsers size={16} />,
      onClick: onMembers,
    },
    {
      label: "Share Invite",
      icon: <FiShare2 size={16} />,
      onClick: onShare,
    },
    {
      label: "Exit Group",
      icon: <FiLogOut size={16} />,
      onClick: onExit,
    },
  ];

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed w-52 bg-white border rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn"
      style={{ top: position.top, left: position.left }}
    >
      {/* NORMAL ITEMS */}
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-black hover:bg-gray-100 transition"
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* DIVIDER */}
      <div className="border-t my-1" />

      {/* DELETE */}
      <button
        onClick={onDelete}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
      >
        <FiTrash2 size={16} />
        Delete Group
      </button>
    </div>
  );
}

export default memo(GroupMenu);
