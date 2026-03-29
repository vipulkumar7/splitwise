import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Debug check
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ EMAIL CONFIG ERROR:", error);
  } else {
    console.log("✅ Email server ready");
  }
});