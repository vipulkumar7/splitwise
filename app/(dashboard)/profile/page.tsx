import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import Profile from "@/features/profile/Profile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const { user } = session || {};

  if (!user) {
    redirect("/login");
  }
  return <Profile user={user} />;
}
