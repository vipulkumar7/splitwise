"use client";

import { memo } from "react";

interface IGroup {
  id: string;
  name: string;
}

interface IGroupListProps {
  groups: IGroup[];
  selectedGroupId?: string;
  onSelect: (groupId: string) => void;
  onAddExpense: (groupId: string) => void;
  onDelete: (groupId: string) => void;
}

function GroupList({
  groups,
  selectedGroupId,
  onSelect,
  onAddExpense,
  onDelete,
}: IGroupListProps) {
  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isSelected = selectedGroupId === group.id;

        return (
          <div
            key={group.id}
            className={`p-4 rounded-xl border transition cursor-pointer
              ${isSelected ? "bg-gray-100 border-gray-300" : "bg-white"}
            `}
            onClick={() => onSelect(group.id)}
          >
            <div className="flex justify-between items-center">
              {/* GROUP NAME */}
              <p className="font-medium truncate">{group.name}</p>

              {/* ACTIONS */}
              <div
                className="flex gap-2"
                onClick={(e) => e.stopPropagation()} // ✅ prevent parent click
              >
                <button
                  onClick={() => onAddExpense(group.id)}
                  className="text-green-600 text-sm hover:underline"
                >
                  Add
                </button>

                <button
                  onClick={() => onDelete(group.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(GroupList);
