import { supabase } from "../../config/supabase.js";
import { getIndiaDayRange } from "../helpers.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const { count: employeesCount, error: empErr } = await supabase
      .from("Users")
      .select("*", { count: "exact", head: true })
      .eq("role", "employee");

    const { count: leadersCount, error: leadErr } = await supabase
      .from("Users")
      .select("*", { count: "exact", head: true })
      .eq("role", "leader");

    const now = new Date();
    const { start: todayStart } = getIndiaDayRange(now);
    const todayStr = todayStart.toISOString().split("T")[0];

    const { data: todayAttendance, error: attErr } = await supabase
      .from("Attendances")
      .select("*")
      .eq("userId", userId)
      .eq("date", todayStr)
      .maybeSingle();

    const todayStatus = todayAttendance
      ? todayAttendance.checkIn
        ? "Checked In"
        : "Absent"
      : "Not Checked In";

    res.status(200).json({
      userName: req.user.name,
      employeesCount: employeesCount || 0,
      leadersCount: leadersCount || 0,
      todayStatus,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
