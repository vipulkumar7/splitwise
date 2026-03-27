import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // ✅ Logged in → go to groups (main screen)
  if (session) {
    redirect("/groups");
  }

  // ❌ Not logged in → login
  redirect("/login");
}