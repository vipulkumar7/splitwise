import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const { name } = await req.json();

    const group = await prisma.group.create({
        data: {
            name,
            members: {
                create: {
                    userId: user!.id,
                },
            },
        },
    });

    return Response.json(group);
}