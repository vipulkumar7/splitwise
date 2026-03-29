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
            splitType,
            splits,
        } = body;

        if (!amount || !groupId || !payerId) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // ✅ create expense
        const expense = await prisma.expense.create({
            data: {
                amount,
                description,
                groupId,
                paidById: payerId,
            },
        });

        // ✅ get group members
        const members = await prisma.groupMember.findMany({
            where: { groupId },
        });

        // =========================
        // EQUAL SPLIT
        // =========================
        if (splitType === "equal") {
            const splitAmount = amount / members.length;

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
            const splitData = Object.entries(splits || {}).map(
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
        console.error(error);
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}