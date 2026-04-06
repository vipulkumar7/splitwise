import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return Response.json({ error: "Missing userId" }, { status: 400 });
        }

        await prisma.groupMember.deleteMany({
            where: {
                groupId: params.id,
                userId,
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