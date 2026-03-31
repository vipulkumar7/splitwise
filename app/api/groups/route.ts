import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ Fetch only groups where user is member
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                expenses: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // ✅ ALWAYS return array
        return Response.json(groups);
    } catch (error) {
        console.error("GROUPS API ERROR:", error);
        return Response.json([], { status: 500 }); // safe fallback
    }
}