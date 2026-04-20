import { IGroupMember } from "./user";

export interface IExpenseSplit {
  userId: string;
  amount: number;
}

export interface IExpense {
  id?: string;
  amount: number;
  paidById?: string;
  description: string | null;
  createdAt: Date;
  payerId: string;
  splits: IExpenseSplit[];
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
  description?: string;
  amount: string;
  payerId: string;
}
