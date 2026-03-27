import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-xl font-bold">
        Welcome {session?.user?.name} 👋
      </h1>
      <p>{session?.user?.email}</p>
    </div>
  );
}