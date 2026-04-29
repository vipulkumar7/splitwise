import { ISplit } from "../api";
import { IGroupMember } from "./user";

export interface IExpenseSplit {
  userId: string;
  amount: number;
}

export interface IExpense {
  id: string;
  amount: number;
  description?: string | null;
  groupId: string;
  paidById: string;
  createdAt: Date;
  splits: ISplit[];
  participants?: { userId: string }[];
}

export interface IExpenseFormModalProps {
  show: boolean;
  onClose: () => void;
  members: IGroupMember[];
  onSave: (data: Partial<IExpenseFormData>) => Promise<void>;
  loading?: boolean;
  editingExpense?: IExpense | null;
  currentUserId?: string;
}

export interface IExpenseList {
  expenses: IExpense[];
  members: IGroupMember[];
  currentUserId?: string;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export interface IExpenseFormData {
  description: string;
  amount: string;
  payerId: string;
  date: string;
}
