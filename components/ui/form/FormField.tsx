"use client";

export default function FormField({ icon: Icon, children, rightIcon }: any) {
  return (
    <div className="relative mb-4">
      {/* LEFT ICON */}
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900" />
      )}

      {/* INPUT / SELECT */}
      {children}

      {/* RIGHT ICON (optional) */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900">
          {rightIcon}
        </div>
      )}
    </div>
  );
}
