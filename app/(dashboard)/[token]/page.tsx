import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params; // ✅ IMPORTANT FIX

    const session = await getServerSession(authOptions);

    // 🔐 If not logged in
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/${token}`);
    }

    const invite = await prisma.groupInvite.findUnique({
        where: { token },
        include: { group: true },
    });

    if (!invite) {
        return <div className="p-4">Invalid invite</div>;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user?.email! },
    });

    if (!user) {
        return <div className="p-4">User not found</div>;
    }

    // ✅ Add user to group
    await prisma.groupMember.upsert({
        where: {
            userId_groupId: {
                userId: user.id,
                groupId: invite.groupId,
            },
        },
        update: {},
        create: {
            userId: user.id,
            groupId: invite.groupId,
        },
    });

    // ✅ Mark invite accepted
    await prisma.groupInvite.update({
        where: { token },
        data: { accepted: true },
    });

    redirect(`/groups/${invite.groupId}`);
}