"use client";

import { IInputProps } from "@/types";
import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ className = "", isExpenseForm, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={clsx(
          "w-full leading-none rounded-xl border border-gray-200 bg-white outline-none transition-all focus:ring-2 focus:ring-green-400 focus:border-transparent",
          isExpenseForm ? "pl-11 pr-3 py-[14px]" : "p-4",
          className,
        )}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
