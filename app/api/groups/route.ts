import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ get current user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ IMPORTANT: include members + expenses
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

        return Response.json(groups);
    } catch (error) {
        console.error(error);
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return Response.json({ error: "Name is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ create group
        const group = await prisma.group.create({
            data: {
                name,
                members: {
                    create: {
                        userId: user.id,
                    },
                },
            },
        });

        return Response.json(group);
    } catch (error) {
        console.error(error);
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}