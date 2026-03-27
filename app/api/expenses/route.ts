import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { amount, description, groupId, paidById, splitType, splits } =
        await req.json();

    const members = await prisma.groupMember.findMany({
        where: { groupId },
    });

    let splitData: any[] = [];

    if (splitType === "equal") {
        const splitAmount = amount / members.length;

        splitData = members.map((m) => ({
            userId: m.userId,
            amount: splitAmount,
        }));
    } else {
        // ✅ custom split
        splitData = members.map((m) => ({
            userId: m.userId,
            amount: splits[m.userId] || 0,
        }));
    }

    const expense = await prisma.expense.create({
        data: {
            amount,
            description,
            groupId,
            paidById,
            splits: {
                create: splitData,
            },
        },
    });

    return Response.json(expense);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    const expenses = await prisma.expense.findMany({
        where: { groupId: groupId! },
        include: {
            splits: {
                include: {
                    user: true, // ✅ include user info
                },
            },
            paidBy: true, // ✅ include payer
        },
    });

    return Response.json(expenses);
}