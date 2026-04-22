import { ISendEmailParams } from "@/types";
import nodemailer from "nodemailer";

// ✅ Create transporter (ONLY ONCE)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!, // App password
  },
});

// ✅ Optional: verify connection (dev only)
if (process.env.NODE_ENV === "development") {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ EMAIL CONFIG ERROR:", error);
    } else {
      console.log("✅ Email server ready");
    }
  });
}

export const sendEmail = async ({ to, subject, html }: ISendEmailParams) => {
  return transporter.sendMail({
    from: `"Splitwise" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
