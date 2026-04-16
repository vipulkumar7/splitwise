"use client";

import { IInputProps } from "@/types";
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full pl-11 pr-3 py-[14px] leading-none rounded-xl 
        border border-gray-200 bg-white
        focus:ring-2 focus:ring-green-400 focus:border-transparent 
        outline-none transition-all ${className}`}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
