import { ReactNode } from "react";

export default function LoginCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-full max-w-md p-8 rounded-3xl 
      bg-white/95 backdrop-blur-xl 
      border border-white/20 
      shadow-[0_20px_60px_rgba(0,0,0,0.4)] 
      text-center space-y-6 z-10"
    >
      {/* LOGO / TITLE */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Splitwise
        </h1>

        <p className="text-gray-500 text-sm">
          Split expenses with friends easily 💸
        </p>
      </div>

      {/* BUTTON */}
      {children}

      {/* DIVIDER */}
      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <div className="flex-1 h-px bg-gray-200" />
        Secure login
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* FOOTER */}
      <p className="text-xs text-gray-400">
        Powered by NextAuth + Google OAuth
      </p>
    </div>
  );
}
