"use client";

import { ButtonVariant, IButtonProps } from "@/types";

export default function Button({
  loading = false,
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: IButtonProps) {
  const base =
    "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2";

  const variants: Record<ButtonVariant, string> = {
    primary: loading
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-green-500 text-white hover:bg-green-600 active:scale-95",

    secondary: "bg-white text-black border hover:bg-gray-100 active:scale-95",
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {/* Loader */}
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}

      {/* Content */}
      <span>{children}</span>
    </button>
  );
}
