import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return Response.json({ count: 0 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const count = await prisma.notification.count({
        where: {
            userId: user?.id,
            read: false,
        },
    });

    return Response.json({ count });
}