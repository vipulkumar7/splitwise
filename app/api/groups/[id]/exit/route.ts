import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: any) {
    const { id } = context.params;

    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return Response.json(
                { error: "User ID required" },
                { status: 400 }
            );
        }

        // ✅ Remove user from group
        await prisma.groupMember.deleteMany({
            where: {
                groupId: id,
                userId: userId,
            },
        });

        return Response.json({ success: true });
    } catch (err) {
        console.error("EXIT GROUP ERROR:", err);
        return Response.json(
            { error: "Failed to exit group" },
            { status: 500 }
        );
    }
}