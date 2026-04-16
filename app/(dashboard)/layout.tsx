import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { JSX } from "react";
import { IDashboardLayoutProps } from "@/types";

export default async function DashboardLayout({
  children,
}: IDashboardLayoutProps): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
