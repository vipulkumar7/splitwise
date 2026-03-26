import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const groupId = params.id;

  try {
    // ✅ delete splits first
    await prisma.split.deleteMany({
      where: {
        expense: {
          groupId,
        },
      },
    });

    // ✅ delete expenses
    await prisma.expense.deleteMany({
      where: { groupId },
    });

    // ✅ delete members
    await prisma.groupMember.deleteMany({
      where: { groupId },
    });

    // ✅ delete group
    await prisma.group.delete({
      where: { id: groupId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}