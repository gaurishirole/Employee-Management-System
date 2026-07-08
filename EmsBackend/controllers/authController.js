import { supabase } from "../config/supabase.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendMail } from "../utils/sendMail.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : "";
    const { data: user, error } = await supabase
      .from("Users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error || !user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user.id);
    res.json({ token, role: user.role, name: user.name, email: user.email, id: user.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : "";
    const { data: user, error } = await supabase
      .from("Users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase.from("ResetTokens").delete().eq("email", normalizedEmail);
    await supabase.from("ResetTokens").insert({ email: normalizedEmail, otp, expiresAt });

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [DEVELOPMENT] Generated OTP for ${normalizedEmail}: ${otp}\n`);

    await sendMail(
      normalizedEmail,
      "Password Reset OTP",
      `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
      `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password Reset OTP</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6fa; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fa; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background: linear-gradient(90deg, #0EA6F0, #A756FA); text-align:center; padding:30px 20px; border-top-left-radius:12px; border-top-right-radius:12px;">
                <h1 style="margin:0; color:#fff; font-size:24px;">QiroTech Innovation Pvt. Ltd.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 25px; text-align:center;">
                <p style="font-size:16px; color:#555; margin-bottom:30px;">
                   You requested a password reset. Use the OTP below to reset your password. This OTP is valid for <strong>5 minutes</strong>.
                </p>
                <p style="font-size:28px; font-weight:bold; color:#0EA6F0; letter-spacing:3px; margin:20px 0;">
                   ${otp}
                </p>
                <p style="font-size:14px; color:#777; margin-top:20px;">
                  If you did not request a password reset, please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f0f3f8; text-align:center; padding:20px 15px;">
                <p style="margin:0; font-size:12px; color:#999;">
                  &copy; 2025 The DataTech Labs Pvt. Ltd. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
      `
    );

    res.json({ message: "OTP sent to your registered email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const normalizedEmail = email.toLowerCase();
    const { data: tokenData, error } = await supabase
      .from("ResetTokens")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", otp)
      .maybeSingle();

    if (error || !tokenData) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (new Date(tokenData.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired." });
    }
    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email ? email.toLowerCase() : "";
    const { data: tokenData, error } = await supabase
      .from("ResetTokens")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", otp)
      .maybeSingle();

    if (error || !tokenData) return res.status(400).json({ message: "Invalid OTP." });

    if (new Date(tokenData.expiresAt).getTime() < Date.now())
      return res.status(400).json({ message: "OTP expired." });

    // Validate password: Minimum 8 characters, one uppercase, one number, one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from("Users").update({ password: hashed }).eq("email", normalizedEmail);
    await supabase.from("ResetTokens").delete().eq("email", normalizedEmail);

    res.json({ message: "Password reset successfully. Please login again." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (res.clearCookie) {
      res.clearCookie("token", { httpOnly: true, path: "/" });
    }
  } catch (e) {
    // ignore
  }
  return res.json({ message: "Logged out" });
};
