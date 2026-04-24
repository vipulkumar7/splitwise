import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import FriendsPageClient from "@/features/friends/FriendsPageClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // 👉 Optional: you can fetch fallback data here if needed
  return <FriendsPageClient />;
}
