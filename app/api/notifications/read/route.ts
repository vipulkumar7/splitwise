import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  await prisma.notification.updateMany({
    where: {
      userId: user?.id,
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
