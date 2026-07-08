import { supabase } from "../../config/supabase.js";

export const getHolidaysForEmployee = async (req, res) => {
  try {
    const { start, end } = req.query;

    let queryBuilder = supabase.from("Holidays").select("*");
    if (start && end) {
      queryBuilder = queryBuilder.gte("date", start.split("T")[0]).lte("date", end.split("T")[0]);
    } else if (start) {
      queryBuilder = queryBuilder.gte("date", start.split("T")[0]);
    } else if (end) {
      queryBuilder = queryBuilder.lte("date", end.split("T")[0]);
    }

    const { data: customHolidays, error } = await queryBuilder.order("date", { ascending: true });
    if (error) throw error;

    const weekendEntries = [];
    const targetStart = start ? new Date(start) : new Date();
    const targetEnd = end ? new Date(end) : new Date(targetStart.getFullYear(), targetStart.getMonth() + 6, 0);
    const cursor = new Date(targetStart);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= targetEnd) {
      const day = cursor.getDay();
      if (day === 0 || day === 6) {
        const dateStr = cursor.toISOString().split("T")[0];
        weekendEntries.push({ date: dateStr, description: "Weekend Off", type: "WEEKEND" });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const customList = customHolidays || [];
    const all = [...customList, ...weekendEntries];
    all.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(all);
  } catch (err) {
    console.error("getHolidaysForEmployee error:", err);
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};
