"use client";

import { ReactNode, ComponentType } from "react";

interface IFormFieldProps {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export default function FormField({
  icon: Icon,
  children,
  rightIcon,
  className = "",
}: IFormFieldProps) {
  return (
    <div className={`relative mb-4 ${className}`}>
      {/* LEFT ICON */}
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
      )}

      {/* INPUT / SELECT */}
      {children}

      {/* RIGHT ICON */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900">
          {rightIcon}
        </div>
      )}
    </div>
  );
}
