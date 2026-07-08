import nodemailer from "nodemailer";

let transporter;

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendMail = async (to, subject, text, html, attachments = []) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"The DataTech Labs Pvt. Ltd." <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};
