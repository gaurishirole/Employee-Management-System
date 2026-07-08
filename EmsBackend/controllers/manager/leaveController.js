import { supabase } from "../../config/supabase.js";
import { sendMail } from "../../utils/sendMail.js";
import { createNotification } from "../notificationController.js";

export const applyLeaderLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate, type } = req.body;
    const leaderId = req.user.id;

    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "reason, fromDate and toDate are required" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to)) {
      return res.status(400).json({ message: "Invalid date(s) provided" });
    }
    if (to < from) {
      return res.status(400).json({ message: "toDate cannot be before fromDate" });
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((to - from) / oneDay) + 1;

    const { data: leave, error: leaveErr } = await supabase
      .from("Leaves")
      .insert({
        userId: leaderId,
        reason,
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
        totalDays,
        type: type || 'Annual Leave',
      })
      .select()
      .single();

    if (leaveErr) throw leaveErr;

    await createNotification({
      message: `${req.user.name} applied for leave from ${new Date(from).toLocaleDateString()} to ${new Date(to).toLocaleDateString()} (${totalDays} days)`,
      role: "admin",
      triggeredBy: leaderId,
    });

    const { data: admins } = await supabase
      .from("Users")
      .select("email")
      .eq("role", "admin");

    const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Leave Application</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6fa; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fa; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(90deg, #0EA6F0, #A756FA); text-align:center; padding:30px 20px; border-top-left-radius:12px; border-top-right-radius:12px;">
              <h1 style="margin:0; color:#fff; font-size:24px;">The DataTech Labs Pvt. Ltd.</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 25px; text-align:center;">
              <p style="font-size:16px; color:#555; margin-bottom:20px;">
                A new leave application has been submitted by <strong>${req.user.name}</strong> (${req.user.email}).
              </p>
              <div style="background-color:#f9f9f9; padding:20px; border-radius:8px; margin:20px 0; text-align:left;">
                <h3 style="margin:0 0 15px 0; color:#0EA6F0; font-size:18px;">Leave Details:</h3>
                <p style="margin:5px 0; font-size:14px;"><strong>From:</strong> ${fromDate}</p>
                <p style="margin:5px 0; font-size:14px;"><strong>To:</strong> ${toDate}</p>
                <p style="margin:5px 0; font-size:14px;"><strong>Total Days:</strong> ${totalDays}</p>
                <p style="margin:5px 0; font-size:14px;"><strong>Reason:</strong> ${reason}</p>
              </div>
              <p style="font-size:14px; color:#777; margin-top:20px;">
                Please review the application in the admin panel.
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
    `;
    (admins || []).forEach(async (admin) => {
      await sendMail(admin.email, "New Leave Application Submitted", "", htmlContent);
    });

    return res.status(201).json(leave);
  } catch (error) {
    console.error("applyLeaderLeave error:", error);
    return res.status(500).json({ message: "Error applying leave", error: error.message });
  }
};

export const getMyLeaderLeaves = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { data: leaves, error: leaveErr } = await supabase
      .from("Leaves")
      .select("*")
      .eq("userId", leaderId)
      .order("appliedAt", { ascending: false });

    if (leaveErr) throw leaveErr;

    const { data: user } = await supabase
      .from("Users")
      .select("leaveAllowance")
      .eq("id", leaderId)
      .maybeSingle();

    const leaveAllowance = user?.leaveAllowance || 12;

    return res.status(200).json({ leaves, leaveAllowance });
  } catch (error) {
    console.error("getMyLeaderLeaves error:", error);
    return res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

export const updateMyLeaderLeave = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { id } = req.params;
    const { reason, fromDate, toDate } = req.body;

    const { data: leave, error: findErr } = await supabase
      .from("Leaves")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.userId !== leaderId) {
      return res.status(403).json({ message: "Not allowed to edit this leave" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be edited" });
    }

    const updatedFields = {};
    if (reason) updatedFields.reason = reason;
    if (fromDate) updatedFields.fromDate = new Date(fromDate).toISOString();
    if (toDate) updatedFields.toDate = new Date(toDate).toISOString();

    const mergedFrom = updatedFields.fromDate || leave.fromDate;
    const mergedTo = updatedFields.toDate || leave.toDate;

    if (mergedFrom && mergedTo) {
      const oneDay = 1000 * 60 * 60 * 24;
      const totalDays = Math.floor((new Date(mergedTo) - new Date(mergedFrom)) / oneDay) + 1;
      updatedFields.totalDays = totalDays > 0 ? totalDays : 0;
    }

    const { data: updatedLeave, error: updErr } = await supabase
      .from("Leaves")
      .update(updatedFields)
      .eq("id", id)
      .select()
      .single();

    if (updErr) throw updErr;

    return res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("updateMyLeaderLeave error:", error);
    return res.status(500).json({ message: "Error updating leave", error: error.message });
  }
};
