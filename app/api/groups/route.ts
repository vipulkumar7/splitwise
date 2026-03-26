import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ================= GET GROUPS =================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: user?.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true, // 🔥 MUST HAVE (fixes payer dropdown)
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return Response.json(groups);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Error fetching groups" }, { status: 500 });
    }
}

// ================= CREATE GROUP =================
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return Response.json({ error: "Name required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const group = await prisma.group.create({
            data: {
                name,
                members: {
                    create: {
                        userId: user!.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return Response.json(group);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Error creating group" }, { status: 500 });
    }
}