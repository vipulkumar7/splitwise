import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import GroupsClient from "@/features/groups/components/GroupsClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <GroupsClient initialGroups={[]} />;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return <GroupsClient initialGroups={[]} />;
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
      expenses: {
        include: {
          splits: true,
          participants: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return <GroupsClient initialGroups={groups} />;
}
