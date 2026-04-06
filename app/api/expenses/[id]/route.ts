
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// ======================
// ✏️ UPDATE EXPENSE
// ======================
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const body = await req.json();
        const { description, amount, payerId } = body;

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                description,
                amount: Number(amount),
                paidById: payerId,
            },
        });

        return Response.json(updated);

    } catch (error: any) {
        console.error("UPDATE ERROR:", error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// ======================
// 🗑 DELETE EXPENSE
// ======================
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        // check exists
        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing) {
            return Response.json({ error: "Not found" }, { status: 404 });
        }

        // delete splits
        await prisma.split.deleteMany({
            where: { expenseId: id },
        });

        // delete expense
        await prisma.expense.delete({
            where: { id },
        });

        return Response.json({ success: true });

    } catch (error: any) {
        console.error("DELETE ERROR:", error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}