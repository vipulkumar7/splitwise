import { RefObject } from "react";
import { IExpense } from "./expense";
import { IUser } from "./user";

interface IGroupMember {
  user: IUser;
}

export interface IGroup {
  id: string;
  name: string;
  members: IGroupMember[];
  expenses: IExpense[];
  createdAt?: string;
  updatedAt?: string;
  isTemp?: boolean;
}

export interface IGroupHeader {
  groupName: string;
  onMenuClick: () => void;
  groupMembers: IGroupMember[];
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

export interface IAvatarGroup {
  members?: IGroupMember[];
}

export interface IConfirmModal {
  show: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  type?: "default" | "danger";
}

export interface IMembersModalProps {
  show: boolean;
  onClose: () => void;
  members: IGroupMember[];
  currentUserId?: string;
}

export interface IShareModalProps {
  show: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  setToast: (data: {
    message: string;
    type: "success" | "error";
    id: number;
  }) => void;
}

export interface IGroupMenuProps {
  show: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>; // ✅ flexible (button/div/etc.)
  onEditGroup: () => void;
  onShare: () => void;
  onExit: () => void;
  onDelete: () => void;
  onMembers: () => void;
}

export interface IPosition {
  top: number;
  left: number;
}
