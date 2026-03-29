import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    try {
        const { token } = await params;

        const session = await getServerSession(authOptions);

        // ❌ Not logged in → redirect
        if (!session?.user?.email) {
            redirect("/login");
        }

        // ✅ find invite
        const invite = await prisma.groupInvite.findUnique({
            where: { token },
        });

        if (!invite) {
            return <p className="p-4">Invalid invite</p>;
        }

        // ✅ find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user) {
            return <p className="p-4">User not found</p>;
        }

        // ✅ CHECK if already member (IMPORTANT FIX)
        const existingMember = await prisma.groupMember.findFirst({
            where: {
                userId: user.id,
                groupId: invite.groupId,
            },
        });

        if (!existingMember) {
            await prisma.groupMember.create({
                data: {
                    userId: user.id,
                    groupId: invite.groupId,
                },
            });
        }

        // ✅ mark invite accepted
        await prisma.groupInvite.update({
            where: { id: invite.id },
            data: { accepted: true },
        });

        // ✅ redirect to group page
        redirect(`/groups/${invite.groupId}`);

    } catch (error) {
        console.error("INVITE ACCEPT ERROR:", error);

        return (
            <div className="p-4 text-red-500">
                Something went wrong. Check logs.
            </div>
        );
    }
}