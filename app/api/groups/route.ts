import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// =========================
// GET GROUPS
// =========================
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json([], { status: 200 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return Response.json([]);

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
                    include: { user: true },
                },
                expenses: true,
            },
        });

        return Response.json(groups);
    } catch (err) {
        console.error(err);
        return Response.json([], { status: 500 });
    }
}

// =========================
// CREATE GROUP ✅
// =========================
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

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ Create group
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
        console.error("CREATE GROUP ERROR:", error);
        return Response.json({ error: "Failed" }, { status: 500 });
    }
}