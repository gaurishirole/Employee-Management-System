import { supabase } from "../../config/supabase.js";
import { sendMail } from "../../utils/sendMail.js";

export const getAllUsersForEmails = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("Users")
      .select("id, name, email, role, position")
      .in("role", ["employee", "leader", "hr"])
      .order("name", { ascending: true });

    if (error) throw error;
    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsersForEmails error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const sendLetterEmail = async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    const file = req.file;

    if (!email || !subject || !file) {
      return res.status(400).json({ message: "Email, subject, and file are required" });
    }

    const attachment = {
      filename: file.originalname || "Letter.pdf",
      content: file.buffer,
    };

    await sendMail(email, subject, body || "Please find the attached letter.", "", [attachment]);

    res.status(200).json({ message: "Letter sent successfully via email" });
  } catch (error) {
    console.error("sendLetterEmail error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
