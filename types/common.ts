import {
  ButtonHTMLAttributes,
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export type ButtonVariant = "primary" | "secondary";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
}

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  isExpenseForm?: boolean;
}

export interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export interface IFormFieldProps {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export type NotificationType =
  | "GENERAL"
  | "USER_JOINED"
  | "EXPENSE_ADDED"
  | "EXPENSE_UPDATED"
  | "EXPENSE_DELETED"
  | "GROUP_CREATED";

export interface INotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
  groupId?: string;
}

export type ToastType = "success" | "error" | "info";

export interface IToast {
  message: string;
  type: ToastType;
  id: number;
}

export interface IToastProps {
  message: string;
  type: ToastType;
  duration: number;
}

export interface IDashboardLayoutProps {
  children: ReactNode;
}
