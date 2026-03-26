import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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