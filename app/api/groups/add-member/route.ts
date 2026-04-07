import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, groupId } = await req.json();

    // current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // 🔥 find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0], // fallback name
        },
      });
    }

    // ❌ self add
    if (currentUser?.email === email) {
      return Response.json({ error: "You are already in group" });
    }

    // ❌ duplicate
    const existing = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (existing) {
      return Response.json({ error: "Already added" });
    }

    // ✅ add member
    await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
      },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}