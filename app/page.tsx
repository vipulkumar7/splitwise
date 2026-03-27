import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // ✅ If logged in → dashboard
  if (session) {
    redirect("/dashboard");
  }

  // ❌ If not logged in → login
  redirect("/login");
}