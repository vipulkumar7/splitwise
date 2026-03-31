import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const groupId = params.id;

        // ✅ check if user is member
        const member = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId: user!.id,
            },
        });

        if (!member) {
            return Response.json({ error: "Not allowed" }, { status: 403 });
        }

        // ✅ delete all related data
        await prisma.split.deleteMany({
            where: {
                expense: {
                    groupId,
                },
            },
        });

        await prisma.expense.deleteMany({
            where: { groupId },
        });

        await prisma.groupMember.deleteMany({
            where: { groupId },
        });

        await prisma.group.delete({
            where: { id: groupId },
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to delete group" });
    }
}