import { format } from "date-fns-tz";
import { supabase } from "../../config/supabase.js";
import { createNotification } from "../notificationController.js";
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

    const timeStr = format(now, "hh:mm a", { timeZone: "Asia/Kolkata" });

    await createNotification({
      message: `${req.user.name} has checked in at ${timeStr}`,
      role: "admin",
      triggeredBy: userId,
    });

    if (req.user.reportingManagerId) {
      await createNotification({
        message: `${req.user.name} has checked in at ${timeStr}`,
        role: "leader",
        recipient: req.user.reportingManagerId,
        triggeredBy: userId,
      });
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
      const { data: isCustomHoliday } = await supabase
        .from("Holidays")
        .select("*")
        .eq("date", todayStr)
        .maybeSingle();

      const isWeekend = [0, 6].includes(new Date(todayStr).getDay());
      const isHoliday = !!isCustomHoliday || isWeekend;
      const status = isHoliday ? "Over-time" : "Present";

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

      const timeStr = format(now, "hh:mm a", { timeZone: "Asia/Kolkata" });

      await createNotification({
        message: `${req.user.name} has checked out at ${timeStr}`,
        role: "admin",
        triggeredBy: userId,
      });

      if (req.user.reportingManagerId) {
        await createNotification({
          message: `${req.user.name} has checked out at ${timeStr}`,
          role: "leader",
          recipient: req.user.reportingManagerId,
          triggeredBy: userId,
        });
      }
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

    let records = [];

    if (date) {
      const dateStr = new Date(date).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("Attendances")
        .select("*")
        .eq("userId", userId)
        .eq("date", dateStr);
      if (error) throw error;
      records = data || [];
    } else if (start && end) {
      const startStr = new Date(start).toISOString().split("T")[0];
      const endStr = new Date(end).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("Attendances")
        .select("*")
        .eq("userId", userId)
        .gte("date", startStr)
        .lte("date", endStr);
      if (error) throw error;
      records = data || [];
    } else {
      return res.status(400).json({ message: "Invalid query parameters" });
    }

    const formattedRecords = {};
    records.forEach((rec) => {
      formattedRecords[rec.date] = {
        checkIn: rec.checkIn || null,
        checkOut: rec.checkOut || null,
        status: rec.status || (rec.checkIn ? "Present" : "Absent"),
      };
    });

    if (date) {
      const singleRecord = records[0] || null;
      return res.status(200).json(singleRecord);
    }

    return res.status(200).json(formattedRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
