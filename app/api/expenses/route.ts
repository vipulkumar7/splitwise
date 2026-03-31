import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const {
            amount,
            description,
            groupId,
            payerId,
            splitType = "equal",
            splits = {},
        } = body;

        if (!amount || !groupId || !payerId) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ Create expense
        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                description,
                groupId,
                paidById: payerId,
            },
        });

        // ✅ Get members
        const members = await prisma.groupMember.findMany({
            where: { groupId },
        });

        // =========================
        // 🔔 NOTIFICATIONS (IMPROVED)
        // =========================
        await prisma.notification.createMany({
            data: members
                .filter((m: any) => m.userId !== payerId)
                .map((m: any) => ({
                    userId: m.userId,
                    message: `${description} added in group 💸`,
                })),
        });

        // =========================
        // EQUAL SPLIT
        // =========================
        if (splitType === "equal") {
            const splitAmount = Number(amount) / members.length;

            await prisma.split.createMany({
                data: members.map((m: any) => ({
                    userId: m.userId,
                    expenseId: expense.id,
                    amount: splitAmount,
                })),
            });
        }

        // =========================
        // CUSTOM SPLIT
        // =========================
        if (splitType === "custom") {
            const splitData = Object.entries(splits).map(
                ([userId, value]: any) => ({
                    userId,
                    expenseId: expense.id,
                    amount: Number(value),
                })
            );

            await prisma.split.createMany({
                data: splitData,
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("EXPENSE ERROR:", error);
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}