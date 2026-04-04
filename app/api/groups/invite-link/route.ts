import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    try {
        const { groupId } = await req.json();

        if (!groupId) {
            return Response.json({ error: "Missing groupId" }, { status: 400 });
        }

        // ✅ try existing invite
        let invite = await prisma.groupInvite.findFirst({
            where: {
                groupId,
                accepted: false,
            },
        });

        // ✅ create if not exists
        if (!invite) {
            const token = randomBytes(32).toString("hex");

            invite = await prisma.groupInvite.create({
                data: {
                    email: "share@link.com", // dummy for share
                    groupId,
                    token,
                },
            });
        }

        const inviteLink = `${process.env.NEXTAUTH_URL}/${invite.token}`;

        return Response.json({
            success: true,
            inviteLink,
        });

    } catch (error) {
        console.error("INVITE LINK ERROR:", error);
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}