import { JSX } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
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
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* ✅ MUST HAVE flex-1 */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom)+4px)]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
