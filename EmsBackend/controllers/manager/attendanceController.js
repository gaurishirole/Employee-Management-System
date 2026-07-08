import { supabase } from "../../config/supabase.js";
import { getIndiaDayRange } from "../helpers.js";

export const leaderCheckIn = async (req, res) => {
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

    if (attendance?.checkIn) {
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
    console.error(err);
    res.status(500).json({ message: "Failed to check in" });
  }
};

export const leaderCheckOut = async (req, res) => {
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

    if (!attendance?.checkIn) {
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
    }

    res.status(200).json(resultAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to check out" });
  }
};

export const getLeaderAttendance = async (req, res) => {
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

      const formatted = {};
      records.forEach((rec) => {
        formatted[rec.date] = rec;
      });
      return res.status(200).json(formatted);
    }

    res.status(400).json({ message: "Invalid query" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

export const getTeamAttendance = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const { start: todayStart } = getIndiaDayRange(targetDate);
    const todayStr = todayStart.toISOString().split("T")[0];

    const { data: teams, error: teamErr } = await supabase
      .from("Teams")
      .select("id, members:Users!TeamMembers(id, name, email)")
      .eq("leaderId", leaderId);

    if (teamErr) throw teamErr;

    const memberMap = new Map();
    (teams || []).forEach((team) => {
      (team.members || []).forEach((member) => {
        memberMap.set(String(member.id), member);
      });
    });
    const members = Array.from(memberMap.values());
    const memberIds = members.map((m) => m.id);

    let attendances = [];
    if (memberIds.length > 0) {
      const { data, error } = await supabase
        .from("Attendances")
        .select("*")
        .in("userId", memberIds)
        .eq("date", todayStr);
      if (error) throw error;
      attendances = data || [];
    }

    const attendanceMap = {};
    attendances.forEach((att) => {
      attendanceMap[String(att.userId)] = att;
    });

    const result = members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      attendance: attendanceMap[String(member.id)] || null,
      status: attendanceMap[String(member.id)]?.status || "Absent",
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching team attendance:", err);
    res.status(500).json({ message: "Failed to fetch team attendance" });
  }
};
