import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await context.params;

    console.log("DELETE GROUP ID:", groupId);

    if (!groupId) {
      return Response.json({ error: "Missing groupId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =========================
    // DELETE ORDER
    // =========================

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

    await prisma.groupInvite.deleteMany({
      where: { groupId },
    });

    await prisma.group.delete({
      where: { id: groupId },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);

    return Response.json(
      {
        error: "Delete failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: await params
    const { id } = await context.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        expenses: {
          include: {
            splits: true,
            paidBy: true,
          },
        },
      },
    });

    if (!group) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    return Response.json(group);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}