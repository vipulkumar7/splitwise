import { sendEmail } from "@/lib/services/email";
import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, groupId } = await req.json();

    // ✅ Validate
    if (!email || !groupId) {
      return Response.json(
        { error: "Missing email or groupId" },
        { status: 400 },
      );
    }

    // ✅ Create invite token
    const token = randomBytes(32).toString("hex");

    await prisma.groupInvite.create({
      data: {
        email,
        groupId,
        token,
      },
    });

    // ✅ Generate invite link (IMPORTANT FIX)
    const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`;

    // ✅ Email HTML
    const html = `
      <div style="background:#f4f6f8;padding:20px 0;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:20px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">Splitwise</h1>
            <p style="color:#dcfce7;margin:4px 0 0;font-size:13px;">
              Smart expense sharing 💸
            </p>
          </div>

          <!-- BODY -->
          <div style="padding:24px;">
            <h2 style="margin:0 0 10px;font-size:18px;color:#111;">
              You're invited 🎉
            </h2>

            <p style="color:#444;font-size:14px;line-height:1.6;">
              Someone invited you to join a group on <b>Splitwise</b>.
              Track shared expenses, split bills, and settle easily.
            </p>

            <!-- CTA BUTTON -->
            <div style="text-align:center;margin:24px 0;">
              <a href="${inviteLink}" 
                style="
                  background:linear-gradient(135deg,#22c55e,#16a34a);
                  color:#ffffff;
                  padding:12px 20px;
                  border-radius:8px;
                  text-decoration:none;
                  font-weight:600;
                  font-size:14px;
                  display:inline-block;
                ">
                🚀 Join Group
              </a>
            </div>

            <!-- FALLBACK LINK -->
            <p style="font-size:12px;color:#888;text-align:center;">
              Or copy & paste this link:
            </p>

            <p style="
              background:#f1f5f9;
              padding:10px;
              border-radius:6px;
              font-size:12px;
              word-break:break-all;
              color:#333;
              text-align:center;
            ">
              ${inviteLink}
            </p>
          </div>

          <!-- FOOTER -->
          <div style="padding:16px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Splitwise • Built with ❤️
          </div>

        </div>
      </div>
      `;

    // ✅ Send email
    await sendEmail({
      to: email,
      subject: "You're invited to join a group 🎉",
      html,
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("INVITE ERROR:", error);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
