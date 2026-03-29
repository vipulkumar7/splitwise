import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const invite = await prisma.groupInvite.findUnique({
        where: { token },
    });

    if (!invite) {
        return <p>Invalid invite</p>;
    }

    if (invite.accepted) {
        return <p>Already accepted</p>;
    }

    // find user
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return <p>User not found</p>;

    // add to group
    await prisma.groupMember.create({
        data: {
            userId: user.id,
            groupId: invite.groupId,
        },
    });

    // mark accepted
    await prisma.groupInvite.update({
        where: { id: invite.id },
        data: { accepted: true },
    });

    redirect(`/groups/${invite.groupId}`);
}