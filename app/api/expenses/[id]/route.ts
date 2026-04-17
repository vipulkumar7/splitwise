import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// ======================
// ✏️ UPDATE EXPENSE
// ======================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { description, amount, payerId } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing expense id",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        description,
        amount: Number(amount),
        paidById: payerId,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 },
    );
  }
}

// ======================
// 🗑 DELETE EXPENSE
// ======================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    // check exists
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 404 },
      );
    }

    // delete splits
    await prisma.split.deleteMany({
      where: { expenseId: id },
    });

    // delete expense
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE ERROR:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 },
    );
  }
}
