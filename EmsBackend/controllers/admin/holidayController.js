import { supabase } from "../../config/supabase.js";
import { sendMail } from "../../utils/sendMail.js";

export const listHolidays = async (req, res) => {
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

    const customHolidays = await queryBuilder.order("date", { ascending: true });
    const weekendEntries = [];
    const targetStart = start ? new Date(start) : new Date();
    const targetEnd = end ? new Date(end) : new Date(targetStart.getFullYear(), targetStart.getMonth() + 6, 0);
    const cursor = new Date(targetStart);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= targetEnd) {
      const day = cursor.getDay();
      if (day === 0 || day === 6) {
        weekendEntries.push({
          date: cursor.toISOString().split("T")[0],
          description: "Weekend Off",
          type: "WEEKEND",
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const customList = customHolidays.data || [];
    const all = [...customList, ...weekendEntries];
    all.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(all);
  } catch (err) {
    console.error("❌ Error listing holidays:", err);
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;
    if (!date || !description) {
      return res.status(400).json({ message: "Date and description are required" });
    }

    const dateStr = date.split("T")[0];
    const day = new Date(dateStr).getDay();
    if (day === 0 || day === 6) {
      return res.status(400).json({ message: "Weekends are already holidays" });
    }

    const { data: holiday, error } = await supabase
      .from("Holidays")
      .insert({
        date: dateStr,
        description,
        type: "CUSTOM",
        createdById: req.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation in Postgres
        return res.status(409).json({ message: "Holiday already exists for this date" });
      }
      throw error;
    }

    try {
      const { data: allUsers } = await supabase.from("Users").from("Users").select("name, email");
      const formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const emailPromises = (allUsers || []).map((user) => {
        const emailSubject = `🎉 Holiday Announcement - ${description}`;
        const emailText = `Dear ${user.name},\n\nA new holiday has been announced!\n\nDate: ${formattedDate}\nReason: ${description}\n\nEnjoy your day off!\n\nBest regards,\nQiroTech Innovation Pvt. Ltd.`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #0EA6F0 0%, #667eea 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Holiday Announcement</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${user.name}</strong>,</p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">We are pleased to announce a new holiday!</p>
              <div style="background-color: #f0f8ff; padding: 20px; border-left: 4px solid #0EA6F0; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 10px 0; font-size: 16px; color: #333;">
                  <strong style="color: #0EA6F0;">📅 Date:</strong> ${formattedDate}
                </p>
                <p style="margin: 10px 0; font-size: 16px; color: #333;">
                  <strong style="color: #0EA6F0;">🎊 Occasion:</strong> ${description}
                </p>
              </div>
              <p style="font-size: 16px; color: #333; margin-top: 20px;">Enjoy your day off!</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 14px; color: #666; margin: 0;">Best regards,</p>
                <p style="font-size: 14px; color: #0EA6F0; font-weight: bold; margin: 5px 0 0 0;">The DataTech Labs Pvt. Ltd.</p>
              </div>
            </div>
          </div>
        `;
        return sendMail(user.email, emailSubject, emailText, emailHtml).catch((err) => {
          console.error(`Failed to send email to ${user.email}:`, err.message);
        });
      });

      await Promise.allSettled(emailPromises);
    } catch (emailErr) {
      console.error("❌ Error sending holiday notification emails:", emailErr);
    }

    res.status(201).json(holiday);
  } catch (err) {
    console.error("❌ Error creating holiday:", err);
    res.status(500).json({ message: "Failed to create holiday" });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: holiday, error: findErr } = await supabase
      .from("Holidays")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    if (holiday.type === "WEEKEND") {
      return res.status(400).json({ message: "Weekend holidays cannot be removed" });
    }

    const { error: delErr } = await supabase.from("Holidays").delete().eq("id", id);
    if (delErr) throw delErr;

    res.json({ message: "Holiday removed" });
  } catch (err) {
    console.error("❌ Error deleting holiday:", err);
    res.status(500).json({ message: "Failed to delete holiday" });
  }
};
