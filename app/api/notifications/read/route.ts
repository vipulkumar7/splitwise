import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return Response.json({ success: false });
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

    return Response.json({ success: true });
}