import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { JSX } from "react";

import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { IDashboardLayoutProps } from "@/types";

export default async function DashboardLayout({
  children,
}: IDashboardLayoutProps): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  // 🔒 Protect routes
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      {/* TOP NAV */}
      <Navbar />

      {/* MAIN CONTENT */}
      <div className="pb-20">{children}</div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-950 border-t z-50">
        <BottomNav />
      </div>
    </>
  );
}
