"use client";

import { IFormFieldProps } from "@/types";

export default function FormField({
  icon: Icon,
  children,
  rightIcon,
  className = "",
}: IFormFieldProps) {
  return (
    <div className={`relative mt-3 mb-3 ${className}`}>
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
