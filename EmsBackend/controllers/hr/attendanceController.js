import { supabase } from "../../config/supabase.js";
import { getIndiaDayRange } from "../helpers.js";

export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const { start: todayStart } = getIndiaDayRange(now);
    const todayStr = todayStart.toISOString().split("T")[0];

    const { data: attendance, error: findErr } = await supabase
      .from("Attendances")
      .select("*")
      .eq("userId", userId)
      .eq("date", todayStr)
      .maybeSingle();

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    let resultAttendance;
    if (!attendance) {
      const { data, error } = await supabase
        .from("Attendances")
        .insert({
          userId,
          date: todayStr,
          status: "Present",
          checkIn: now.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      resultAttendance = data;
    } else {
      const { data, error } = await supabase
        .from("Attendances")
        .update({
          checkIn: now.toISOString(),
          status: "Present",
        })
        .eq("id", attendance.id)
        .select()
        .single();
      if (error) throw error;
      resultAttendance = data;
    }

    res.status(200).json(resultAttendance);
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Failed to check in" });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const { start: todayStart } = getIndiaDayRange(now);
    const todayStr = todayStart.toISOString().split("T")[0];

    const { data: attendance, error: findErr } = await supabase
      .from("Attendances")
      .select("*")
      .eq("userId", userId)
      .eq("date", todayStr)
      .maybeSingle();

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first" });
    }

    let resultAttendance = attendance;
    if (!attendance.checkOut) {
      const status = attendance.status || (attendance.checkIn ? "Present" : "Absent");
      const { data, error } = await supabase
        .from("Attendances")
        .update({
          checkOut: now.toISOString(),
          status,
        })
        .eq("id", attendance.id)
        .select()
        .single();
      if (error) throw error;
      resultAttendance = data;
    }

    res.status(200).json(resultAttendance);
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Failed to check out" });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, start, end } = req.query;

    if (date) {
      const dateStr = new Date(date).toISOString().split("T")[0];
      const { data: records, error } = await supabase
        .from("Attendances")
        .select("*")
        .eq("userId", userId)
        .eq("date", dateStr);

      if (error) throw error;
      return res.status(200).json(records[0] || null);
    } else if (start && end) {
      const startStr = new Date(start).toISOString().split("T")[0];
      const endStr = new Date(end).toISOString().split("T")[0];

      const { data: records, error } = await supabase
        .from("Attendances")
        .select("*")
        .eq("userId", userId)
        .gte("date", startStr)
        .lte("date", endStr);

      if (error) throw error;

      const formattedRecords = {};
      records.forEach((rec) => {
        const recordDate = rec.date;
        formattedRecords[recordDate] = {
          checkIn: rec.checkIn || null,
          checkOut: rec.checkOut || null,
          status: rec.status || (rec.checkIn ? "Present" : "Absent"),
        };
      });
      return res.status(200).json(formattedRecords);
    }
    return res.status(400).json({ message: "Invalid query parameters" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDateStr = (date ? new Date(date) : new Date()).toISOString().split("T")[0];

    const { data: users, error: userErr } = await supabase
      .from("Users")
      .select("id, name, email, role, position")
      .in("role", ["employee", "leader"]);

    if (userErr) throw userErr;

    const { data: records, error: attErr } = await supabase
      .from("Attendances")
      .select("*")
      .eq("date", targetDateStr);

    if (attErr) throw attErr;

    const attendanceMap = {};
    records.forEach((r) => {
      attendanceMap[String(r.userId)] = r;
    });

    const result = users.map((user) => {
      const attendance = attendanceMap[String(user.id)];
      return {
        user,
        status: attendance?.status || "Absent",
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("getAllAttendance error:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};
