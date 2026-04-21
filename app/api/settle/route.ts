import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId, amount } = await req.json();

    // 1. Save settlement record
    await prisma.settlement.create({
      data: {
        fromUserId: session.user.id,
        toUserId: friendId,
        amount,
      },
    });

    // 👉 OPTIONAL: You can also store a "settled expense"
    // or mark balances as cleared logically

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
