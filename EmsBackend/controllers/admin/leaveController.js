import { supabase } from "../../config/supabase.js";
import { sendMail } from "../../utils/sendMail.js";
import { createNotification } from "../notificationController.js";

export const getAllLeaves = async (req, res) => {
  try {
    const { data: leaves, error } = await supabase
      .from("Leaves")
      .select(`
        *,
        user:Users!userId(id, name, role)
      `)
      .order("appliedAt", { ascending: false });

    if (error) throw error;
    res.status(200).json(leaves);
  } catch (error) {
    console.error("getAllLeaves error:", error);
    res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { data: leave, error: findErr } = await supabase
      .from("Leaves")
      .select(`
        *,
        user:Users!userId(
          id, name, email, reportingManagerId, role,
          reportingManager:Users!reportingManagerId(id, name, email)
        )
      `)
      .eq("id", req.params.id)
      .maybeSingle();

    if (findErr || !leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be approved" });
    }

    const { data: updatedLeave, error: updErr } = await supabase
      .from("Leaves")
      .update({ status: "Approved" })
      .eq("id", req.params.id)
      .select(`
        *,
        user:Users!userId(
          id, name, email, reportingManagerId, role,
          reportingManager:Users!reportingManagerId(id, name, email)
        )
      `)
      .single();

    if (updErr) throw updErr;

    await createNotification({
      message: `Your leave from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(
        leave.toDate
      ).toLocaleDateString()} has been approved`,
      role: leave.user.role || "employee",
      recipient: leave.user.id,
      triggeredBy: req.user.id,
    });

    if (leave.user.reportingManagerId) {
      await createNotification({
        message: `Leave application of ${leave.user.name} from ${new Date(
          leave.fromDate
        ).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been approved`,
        role: "leader",
        recipient: leave.user.reportingManagerId,
        triggeredBy: req.user.id,
      });
    }

    const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave Approved</title>
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
                Dear <strong>${leave.user.name}</strong>,
              </p>
              <div style="background-color:#d4edda; padding:20px; border-radius:8px; margin:20px 0; text-align:left; border-left:4px solid #28a745;">
                <h3 style="margin:0 0 15px 0; color:#155724; font-size:18px;">Leave Approved</h3>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>From:</strong> ${new Date(
                  leave.fromDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>To:</strong> ${new Date(
                  leave.toDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>Total Days:</strong> ${leave.totalDays}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>Reason:</strong> ${leave.reason}</p>
              </div>
              <p style="font-size:14px; color:#777; margin-top:20px;">
                Your leave application has been approved. You can enjoy your leave as scheduled.
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
    await sendMail(leave.user.email, "Leave Approved", "", htmlContent);

    if (leave.user.reportingManager && leave.user.reportingManager.email) {
      const managerHtmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave Approved - Notification</title>
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
                Dear <strong>${leave.user.reportingManager.name}</strong>,
              </p>
              <div style="background-color:#d4edda; padding:20px; border-radius:8px; margin:20px 0; text-align:left; border-left:4px solid #28a745;">
                <h3 style="margin:0 0 15px 0; color:#155724; font-size:18px;">Leave Approved</h3>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>Employee:</strong> ${leave.user.name}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>From:</strong> ${new Date(
                  leave.fromDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>To:</strong> ${new Date(
                  leave.toDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>Total Days:</strong> ${leave.totalDays}</p>
                <p style="margin:5px 0; font-size:14px; color:#155724;"><strong>Reason:</strong> ${leave.reason}</p>
              </div>
              <p style="font-size:14px; color:#777; margin-top:20px;">
                This is to inform you that the leave application of <strong>${leave.user.name}</strong> has been approved by the admin.
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
      await sendMail(leave.user.reportingManager.email, "Leave Approved - Team Member Notification", "", managerHtmlContent);
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("approveLeave error:", error);
    res.status(500).json({ message: "Error approving leave", error: error.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { data: leave, error: findErr } = await supabase
      .from("Leaves")
      .select(`
        *,
        user:Users!userId(
          id, name, email, reportingManagerId, role,
          reportingManager:Users!reportingManagerId(id, name, email)
        )
      `)
      .eq("id", req.params.id)
      .maybeSingle();

    if (findErr || !leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be rejected" });
    }

    const { data: updatedLeave, error: updErr } = await supabase
      .from("Leaves")
      .update({ status: "Rejected" })
      .eq("id", req.params.id)
      .select(`
        *,
        user:Users!userId(
          id, name, email, reportingManagerId, role,
          reportingManager:Users!reportingManagerId(id, name, email)
        )
      `)
      .single();

    if (updErr) throw updErr;

    await createNotification({
      message: `Your leave from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(
        leave.toDate
      ).toLocaleDateString()} has been rejected`,
      role: leave.user.role || "employee",
      recipient: leave.user.id,
      triggeredBy: req.user.id,
    });

    if (leave.user.reportingManagerId) {
      await createNotification({
        message: `Leave application of ${leave.user.name} from ${new Date(
          leave.fromDate
        ).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been rejected`,
        role: "leader",
        recipient: leave.user.reportingManagerId,
        triggeredBy: req.user.id,
      });
    }

    const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave Rejected</title>
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
                Dear <strong>${leave.user.name}</strong>,
              </p>
              <div style="background-color:#f8d7da; padding:20px; border-radius:8px; margin:20px 0; text-align:left; border-left:4px solid #dc3545;">
                <h3 style="margin:0 0 15px 0; color:#721c24; font-size:18px;">Leave Rejected</h3>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>From:</strong> ${new Date(
                  leave.fromDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>To:</strong> ${new Date(
                  leave.toDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>Total Days:</strong> ${leave.totalDays}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>Reason:</strong> ${leave.reason}</p>
              </div>
              <p style="font-size:14px; color:#777; margin-top:20px;">
                Unfortunately, your leave application has been rejected. Please contact your manager for more details or reapply if needed.
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
    await sendMail(leave.user.email, "Leave Rejected", "", htmlContent);

    if (leave.user.reportingManager && leave.user.reportingManager.email) {
      const managerHtmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave Rejected - Notification</title>
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
                Dear <strong>${leave.user.reportingManager.name}</strong>,
              </p>
              <div style="background-color:#f8d7da; padding:20px; border-radius:8px; margin:20px 0; text-align:left; border-left:4px solid #dc3545;">
                <h3 style="margin:0 0 15px 0; color:#721c24; font-size:18px;">Leave Rejected</h3>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>Employee:</strong> ${leave.user.name}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>From:</strong> ${new Date(
                  leave.fromDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>To:</strong> ${new Date(
                  leave.toDate
                ).toLocaleDateString()}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>Total Days:</strong> ${leave.totalDays}</p>
                <p style="margin:5px 0; font-size:14px; color:#721c24;"><strong>Reason:</strong> ${leave.reason}</p>
              </div>
              <p style="font-size:14px; color:#777; margin-top:20px;">
                This is to inform you that the leave application of <strong>${leave.user.name}</strong> has been rejected by the admin.
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
      await sendMail(leave.user.reportingManager.email, "Leave Rejected - Team Member Notification", "", managerHtmlContent);
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("rejectLeave error:", error);
    res.status(500).json({ message: "Error rejecting leave", error: error.message });
  }
};

export const updateUserLeaveAllowance = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveAllowance } = req.body;

    if (typeof leaveAllowance !== "number" || leaveAllowance < 0) {
      return res.status(400).json({ message: "Leave allowance must be a positive number" });
    }

    const { data: user, error: updErr } = await supabase
      .from("Users")
      .update({ leaveAllowance })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Leave allowance updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveAllowance: user.leaveAllowance,
      },
    });
  } catch (err) {
    console.error("Error updating leave allowance:", err);
    res.status(500).json({
      message: "Failed to update leave allowance",
      error: err.message,
    });
  }
};

export const getUserLeaveInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error: userErr } = await supabase
      .from("Users")
      .select("id, name, email, role, leaveAllowance")
      .eq("id", id)
      .maybeSingle();

    if (userErr || !user) return res.status(404).json({ message: "User not found" });

    const currentYear = new Date().getFullYear();
    const yearStartStr = `${currentYear}-01-01`;
    const yearEndStr = `${currentYear}-12-31`;

    const { data: leaves, error: leaveErr } = await supabase
      .from("Leaves")
      .select("*")
      .eq("userId", id)
      .eq("status", "Approved")
      .lte("fromDate", yearEndStr)
      .gte("toDate", yearStartStr);

    if (leaveErr) throw leaveErr;

    let usedDays = 0;
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    (leaves || []).forEach((leave) => {
      const from = new Date(Math.max(new Date(leave.fromDate).getTime(), yearStart.getTime()));
      const to = new Date(Math.min(new Date(leave.toDate).getTime(), yearEnd.getTime()));
      const days = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
      usedDays += days;
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      leaveAllowance: user.leaveAllowance || 12,
      usedLeaves: usedDays,
      remainingLeaves: Math.max(0, (user.leaveAllowance || 12) - usedDays),
    });
  } catch (err) {
    console.error("Error fetching leave info:", err);
    res.status(500).json({
      message: "Failed to fetch leave info",
      error: err.message,
    });
  }
};
