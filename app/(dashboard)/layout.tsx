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
      {/* Navbar */}
      {/* <div className="flex justify-between p-4 border-b">
        <h1 className="font-bold">Splitwise</h1>
        <UserMenu user={session.user} />
      </div> */}

      {children}
    </div>
  );
}