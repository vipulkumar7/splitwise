import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import LoginClient from "@/features/login/LoginClient";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/friends");
  }

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] px-4 mx-auto">
      <LoginClient />
    </div>
  );
}
