import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const body = await req.json().catch(() => ({}));
  const { ids, groupId } = body;

  let whereClause: any = {
    userId: user?.id,
    read: false,
  };

  // 🔥 Option 1: mark specific notifications
  if (ids?.length) {
    whereClause.id = { in: ids };
  }

  // 🔥 Option 2: mark group-specific
  if (groupId) {
    whereClause.groupId = groupId;
  }

  await prisma.notification.updateMany({
    where: whereClause,
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
