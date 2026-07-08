import { getTransporter } from "../config/nodemailer.js";

export const sendMail = async (to, subject, text, html, attachments = []) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"QiroTech Innovation Pvt. Ltd." <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
