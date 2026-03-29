import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, groupId } = await req.json();

    // ✅ validation
    if (!email || !groupId) {
      return NextResponse.json(
        { error: "Email and groupId required" },
        { status: 400 }
      );
    }

    // ✅ generate token
    const token = randomBytes(32).toString("hex");

    // ✅ save invite in DB
    const invite = await prisma.groupInvite.create({
      data: {
        email,
        token,
        groupId,
      },
    });

    // ✅ create invite URL
    const inviteUrl = `${process.env.NEXTAUTH_URL}/${token}`;

    console.log("📨 Invite link:", inviteUrl);

    // ✅ send email
    try {
      const info = await transporter.sendMail({
        from: `"Splitwise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You're invited to Splitwise 🎉",
        html: `
          <h2>You're invited 🎉</h2>
          <p>You have been invited to join a group.</p>
          <p>Click below to join:</p>
          <a href="${inviteUrl}" style="padding:10px 20px;background:#16a34a;color:white;border-radius:5px;text-decoration:none;">
            Join Group
          </a>
          <p style="margin-top:10px;">Or copy this link:</p>
          <p>${inviteUrl}</p>
        `,
      });

      console.log("✅ EMAIL SENT:", info.messageId);

      return NextResponse.json({
        success: true,
        message: "Invite sent",
      });

    } catch (emailError) {
      console.error("❌ EMAIL ERROR:", emailError);

      // fallback → still return success (so flow continues)
      return NextResponse.json({
        success: true,
        message: "Invite created (check console for link)",
        inviteUrl, // useful for dev
      });
    }

  } catch (error) {
    console.error("❌ INVITE API ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}