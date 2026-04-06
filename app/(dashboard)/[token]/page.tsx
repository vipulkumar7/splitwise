import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationType } from "@prisma/client";
export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    if (!token) {
        return <div className="p-4">Invalid invite link</div>;
    }

    const session = await getServerSession(authOptions);

    // 🔐 Not logged in
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/${token}`);
    }

    // 🔍 Find invite
    const invite = await prisma.groupInvite.findUnique({
        where: { token },
        include: { group: true },
    });

    if (!invite) {
        return <div className="p-4">Invalid or expired invite</div>;
    }

    // 🔍 Find user
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

    // =========================
    // 🔔 NOTIFICATIONS
    // =========================

    // 1️⃣ Notify joined user
    await prisma.notification.create({
        data: {
            userId: user.id,
            type: NotificationType.USER_JOINED,
            message: `You joined "${invite.group.name}" 🎉`,
        },
    });

    // 2️⃣ Notify other members
    const members = await prisma.groupMember.findMany({
        where: { groupId: invite.groupId },
    });

    const notifications = members
        .filter((m: any) => m.userId !== user.id)
        .map((m: any) => ({
            userId: m.userId,
            type: NotificationType.USER_JOINED,
            message: ` ${user.name || user.email} joined "${invite.group.name}" 👥`,
        }));

    if (notifications.length > 0) {
        await prisma.notification.createMany({
            data: notifications,
        });
    }

    // ✅ Mark invite accepted (ONLY ONCE)
    await prisma.groupInvite.update({
        where: { token },
        data: { accepted: true },
    });

    // 🚀 Redirect
    redirect(`/groups/${invite.groupId}`);
}