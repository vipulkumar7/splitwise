import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return Response.json([], { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const notifications = await prisma.notification.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: "desc" },
    });

    return Response.json(notifications);
}