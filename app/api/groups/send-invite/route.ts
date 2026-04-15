import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, groupId } = await req.json();

    if (!email || !groupId) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ check if already invited
    let invite = await prisma.groupInvite.findFirst({
      where: {
        email,
        groupId,
        accepted: false,
      },
    });

    // ✅ create new token if not exists
    if (!invite) {
      const token = randomBytes(32).toString("hex");

      invite = await prisma.groupInvite.create({
        data: {
          email,
          groupId,
          token,
        },
      });
    }

    // ✅ generate invite link
    const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

    // =========================
    // 📧 EMAIL CONFIG (GMAIL)
    // =========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    await transporter.sendMail({
      from: `"Splitwise" <${process.env.EMAIL_USER} >`,
      to: email,
      subject: "You're invited to join a group 💸",
      html: `
        <h2>Join my Splitwise group</h2>
        <p>Click below to join:</p>
        <a href="${inviteLink}" style="padding:10px 15px;background:#22c55e;color:white;border-radius:5px;text-decoration:none;">
          Join Group
        </a>
        <p>${inviteLink}</p>
      `,
    });

    return Response.json({
      success: true,
      inviteLink, // ✅ important (reuse everywhere)
    });

  } catch (error) {
    console.error("INVITE ERROR:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}