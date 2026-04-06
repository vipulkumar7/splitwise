import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserMenu from "@/components/auth/UserMenu";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // 🔥 protect routes
  }

  return (
    <div>
      {children}
    </div>
  );
}