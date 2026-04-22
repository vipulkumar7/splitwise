import { RefObject } from "react";
import { IExpense, IExpenseFormData } from "./expense";
import { IUser } from "./user";
import { IToast } from "../common";
import { Prisma } from "@prisma/client";

export interface IPageProps {
  params: Promise<{ id: string }>;
}

interface IGroupMember {
  userId?: string;
  user: IUser;
}

export interface IGroup {
  id: string;
  name: string;
  members: IGroupMember[];
  expenses: IExpense[];
  createdAt?: Date;
  updatedAt?: Date;
  isTemp?: boolean;
}

export interface IGroupHeader {
  groupName: string;
  onMenuClick: () => void;
  groupMembers: IGroupMember[];
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

export interface IGroupUIState {
  showMenu: boolean;
  showModal: boolean;
  showShare: boolean;
  showMembers: boolean;
  showDelete: boolean;
  showExit: boolean;
  showDeleteConfirm: boolean;
  showEditGroup: boolean;
}

export interface IGroupModalsProps {
  ui: IGroupUIState;
  setUI: React.Dispatch<React.SetStateAction<IGroupUIState>>;
  group: IGroup;
  members: IGroupMember[];
  currentUserId: string;
  editingExpense: IExpense | null;
  handleDeleteExpense: () => void;
  deleting: boolean;
  handleSave: (data: Partial<IExpenseFormData>) => Promise<void>;
  deleteGroup: () => void;
  exitGroup: () => void;
  setToast: (toast: IToast) => void;
  saving: boolean;
  deletingGroup: boolean;
  exitingGroup: boolean;
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
  anchorRef?: RefObject<HTMLElement | null>;
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

export type GroupWithRelations = Prisma.GroupGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
    expenses: {
      include: {
        splits: true;
      };
    };
  };
}>;
