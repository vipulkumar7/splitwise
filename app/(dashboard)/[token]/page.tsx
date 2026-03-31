import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    // ✅ FIX: unwrap params
    const { token } = await params;

    if (!token) {
        return <div className="p-4">Invalid invite link</div>;
    }

    const session = await getServerSession(authOptions);

    // 🔐 If not logged in → redirect back after login
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/${token}`);
    }

    // ✅ Find invite
    const invite = await prisma.groupInvite.findUnique({
        where: { token },
        include: { group: true },
    });

    if (!invite) {
        return <div className="p-4">Invalid or expired invite</div>;
    }

    // ✅ Find user
    const user = await prisma.user.findUnique({
        where: { email: session.user?.email! },
    });

    if (!user) {
        return <div className="p-4">User not found</div>;
    }

    // ✅ Add user to group (safe)
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

    // =========================
    // 🔔 NOTIFICATIONS (JOIN FIX)
    // =========================

    // 1. Notify joined user
    await prisma.notification.create({
        data: {
            userId: user.id,
            message: `You joined "${invite.group.name}" 🎉`,
        },
    });

    // 2. Notify existing members
    const members = await prisma.groupMember.findMany({
        where: { groupId: invite.groupId },
    });

    await prisma.notification.createMany({
        data: members
            .filter((m: any) => m.userId !== user.id)
            .map((m: any) => ({
                userId: m.userId,
                message: `${user.name || user.email} joined "${invite.group.name}"`,
            })),
    });

    // ✅ Mark invite accepted
    await prisma.groupInvite.update({
        where: { token },
        data: { accepted: true },
    });

    // 🚀 Redirect to group
    redirect(`/groups/${invite.groupId}`);
}