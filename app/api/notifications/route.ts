import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json([], { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const notifications = await prisma.notification.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json(notifications);
}