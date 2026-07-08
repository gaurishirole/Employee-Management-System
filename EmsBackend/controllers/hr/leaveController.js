import { supabase } from "../../config/supabase.js";
import { createNotification } from "../notificationController.js";

export const applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate, type } = req.body;
    const userId = req.user.id;

    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "reason, fromDate and toDate are required" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) {
      return res.status(400).json({ message: "toDate cannot be before fromDate" });
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((to - from) / oneDay) + 1;

    const { data: leave, error } = await supabase
      .from("Leaves")
      .insert({
        userId,
        reason,
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
        totalDays,
        type: type || 'Annual Leave',
      })
      .select()
      .single();

    if (error) throw error;

    await createNotification({
      message: `${req.user.name} applied for leave from ${new Date(from).toLocaleDateString()} to ${new Date(to).toLocaleDateString()} (${totalDays} days)`,
      role: "admin",
      triggeredBy: userId,
    });

    return res.status(201).json(leave);
  } catch (error) {
    console.error("applyLeave error:", error);
    return res.status(500).json({ message: "Error applying leave", error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: leaves, error: leaveErr } = await supabase
      .from("Leaves")
      .select("*")
      .eq("userId", userId)
      .order("appliedAt", { ascending: false });

    if (leaveErr) throw leaveErr;

    const { data: user, error: userErr } = await supabase
      .from("Users")
      .select("leaveAllowance")
      .eq("id", userId)
      .maybeSingle();

    const leaveAllowance = user?.leaveAllowance || 12;

    return res.status(200).json({ leaves, leaveAllowance });
  } catch (error) {
    console.error("getMyLeaves error:", error);
    return res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

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

    const employeeLeaves = leaves.filter((l) => l.user && l.user.role === "employee");

    res.status(200).json(employeeLeaves);
  } catch (error) {
    console.error("getAllLeaves error:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data: leave, error: updErr } = await supabase
      .from("Leaves")
      .update({ status })
      .eq("id", id)
      .select(`
        *,
        user:Users!userId(id, name, role)
      `)
      .maybeSingle();

    if (updErr) throw updErr;
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    await createNotification({
      message: `Your leave request has been ${status.toLowerCase()} by HR`,
      role: leave.user.role || "employee",
      recipient: leave.user.id,
      triggeredBy: req.user.id,
    });

    res.status(200).json(leave);
  } catch (error) {
    console.error("updateLeaveStatus error:", error);
    res.status(500).json({ message: "Failed to update leave status" });
  }
};
