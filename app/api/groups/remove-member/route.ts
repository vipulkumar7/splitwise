import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, groupId } = await req.json();

        if (!userId || !groupId) {
            return Response.json({ error: "Missing fields" }, { status: 400 });
        }

        // 🔍 Get current user
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // ❗ Prevent removing yourself using remove API (use exit instead)
        // (optional safety)
        // if (currentUser.id === userId) {
        //   return Response.json({ error: "Use exit instead" }, { status: 400 });
        // }

        // ✅ Remove member
        await prisma.groupMember.deleteMany({
            where: {
                userId,
                groupId,
            },
        });

        return Response.json({ success: true });
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}