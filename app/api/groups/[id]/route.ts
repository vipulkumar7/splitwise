import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// =========================
// GET
// =========================
export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX

    console.log("GET GROUP ID:", id);

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true },
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
    console.error("GET ERROR:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// =========================
// PATCH
// =========================
export async function PATCH(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return Response.json({ error: "Name required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: user.id,
      },
    });

    if (!isMember) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: { name },
    });

    return Response.json(updatedGroup);
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return Response.json({ error: "Failed to update group" }, { status: 500 });
  }
}

// =========================
// DELETE
// =========================
export async function DELETE(req: Request, context: any) {
  try {
    const { id: groupId } = await context.params; // ✅ FIX

    console.log("DELETE GROUP:", groupId);

    await prisma.split.deleteMany({
      where: {
        expense: { groupId },
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
      { error: "Delete failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ FIXED TYPE
) {
  try {
    const { id } = await context.params; // ✅ MUST await

    const body = await req.json();

    const updated = await prisma.group.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("UPDATE GROUP ERROR:", err); // ✅ add this
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}