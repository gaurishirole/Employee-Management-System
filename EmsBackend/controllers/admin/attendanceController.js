import { supabase } from "../../config/supabase.js";

export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const targetDateStr = date.split("T")[0];

    const { data: holiday } = await supabase
      .from("Holidays")
      .select("*")
      .eq("date", targetDateStr)
      .maybeSingle();

    const { data: attendanceRecords } = await supabase
      .from("Attendances")
      .select("*, user:Users!userId(id, name, role, email)")
      .eq("date", targetDateStr);

    const { data: leaveRecords } = await supabase
      .from("Leaves")
      .select("*, user:Users!userId(id, name, role, email)")
      .lte("fromDate", targetDateStr)
      .gte("toDate", targetDateStr);

    const { data: allUsers } = await supabase
      .from("Users")
      .select("id, name, role");

    const attendanceMap = new Map((attendanceRecords || []).map((a) => [String(a.userId), a]));
    const leaveMap = new Map((leaveRecords || []).map((l) => [String(l.userId), l]));

    const fullList = (allUsers || []).map((u) => {
      const uid = String(u.id);
      const att = attendanceMap.get(uid);
      const leave = leaveMap.get(uid);

      if (holiday) {
        if (att && att.checkIn && att.checkOut) {
          return {
            user: u,
            date: att.date || targetDateStr,
            status: "Over-time",
            checkIn: att.checkIn || null,
            checkOut: att.checkOut || null,
            holidayDescription: holiday.description,
          };
        }

        if (leave) {
          return {
            user: u,
            date: targetDateStr,
            status: "Leave",
            checkIn: att?.checkIn || null,
            checkOut: att?.checkOut || null,
          };
        }

        return {
          user: u,
          date: att?.date || targetDateStr,
          status: "Holiday",
          checkIn: att?.checkIn || null,
          checkOut: att?.checkOut || null,
          holidayDescription: holiday.description,
        };
      } else if (att) {
        return {
          user: u,
          date: att.date,
          status: att.status || "Present",
          checkIn: att.checkIn || null,
          checkOut: att.checkOut || null,
        };
      } else if (leave) {
        return {
          user: u,
          date: targetDateStr,
          status: "Leave",
          checkIn: null,
          checkOut: null,
        };
      } else {
        return {
          user: u,
          date: targetDateStr,
          status: "Absent",
          checkIn: null,
          checkOut: null,
        };
      }
    });

    fullList.sort((a, b) => (a.user?.name || "").localeCompare(b.user?.name || ""));
    res.json(fullList);
  } catch (err) {
    console.error("❌ Error fetching attendance by date:", err);
    res.status(500).json({ message: "Server error" });
  }
};
