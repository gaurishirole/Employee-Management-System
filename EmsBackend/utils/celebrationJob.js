import cron from "node-cron";
import { supabase } from "../config/supabase.js";
import { sendMail } from "../utils/sendMail.js";

const getISTDate = () =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

const fetchByField = async (field, day, month) => {
  const { data: users, error } = await supabase
    .from("Users")
    .select(`name, email, role, ${field}`)
    .not(field, "is", null)
    .eq("isActive", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (users || []).filter(user => {
    const val = user[field];
    if (!val) return false;
    const dateVal = new Date(val);
    return dateVal.getDate() === day && (dateVal.getMonth() + 1) === month;
  });
};

const fetchMarriages = async (day, month) => {
  const { data: users, error } = await supabase
    .from("Users")
    .select("name, email, role, marriageAnniversary")
    .eq("isMarried", true)
    .not("marriageAnniversary", "is", null)
    .eq("isActive", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (users || []).filter(user => {
    const val = user.marriageAnniversary;
    if (!val) return false;
    const dateVal = new Date(val);
    return dateVal.getDate() === day && (dateVal.getMonth() + 1) === month;
  });
};

const buildHtml = (sections) => {
  const list = (people) =>
    people.map((p) => `<li style="padding:8px 0; border-bottom:1px solid #eef2f7;">
        <span style="font-weight:600; color:#222;">${p.name}</span>
        <span style="color:#7a8699;"> — ${p.role}</span>
      </li>`).join("") ||
    `<li style="padding:8px 0; color:#7a8699;">No events</li>`;

  const section = (title, people) => `
    <tr>
      <td style="padding:0 25px 10px;">
        <h3 style="margin:20px 0 10px; font-size:16px; color:#0EA6F0;">${title}</h3>
        <ul style="list-style:none; margin:0; padding:0; background:#fafcff; border:1px solid #eef2f7; border-radius:8px; padding:12px 16px;">
          ${list(people)}
        </ul>
      </td>
    </tr>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Today's Celebrations</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6fa; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fa; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background: linear-gradient(90deg, #0EA6F0, #A756FA); text-align:center; padding:24px 20px;">
                <h1 style="margin:0; color:#fff; font-size:22px;">QiroTech Innovation Pvt. Ltd.</h1>
                <p style="margin:6px 0 0; color:#e9f6ff; font-size:14px;">Celebrations Update</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 25px 8px; text-align:center;">
                <h2 style="margin:0; color:#1f2d3d; font-size:20px;">🎉 Today's Celebrations 🎉</h2>
                <p style="margin:8px 0 0; color:#6b778c; font-size:14px;">Join us in congratulating and celebrating our teammates!</p>
              </td>
            </tr>
            ${section("Birthdays", sections.birthdays)}
            ${section("Work Anniversaries", sections.workAnniversaries)}
            ${section("Marriage Anniversaries", sections.marriageAnniversaries)}
            <tr>
              <td style="padding:10px 25px 20px; text-align:center;">
                <p style="margin:0;">Wishing them a wonderful day! 🌟</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f0f3f8; text-align:center; padding:16px 15px;">
                <p style="margin:0; font-size:12px; color:#8590a3;">&copy; 2025 QiroTech Innovation Pvt. Ltd. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

export const startCelebrationJob = () => {
  cron.schedule(
    "1 0 * * *",
    async () => {
      try {
        const date = getISTDate(),
          d = date.getDate(),
          m = date.getMonth() + 1;

        const [birthdays, workAnniversaries, marriageAnniversaries] = await Promise.all([
          fetchByField("dateOfBirth", d, m),
          fetchByField("dateOfJoining", d, m),
          fetchMarriages(d, m),
        ]);

        if (!birthdays.length && !workAnniversaries.length && !marriageAnniversaries.length)
          return;

        const { data: recipients, error: recErr } = await supabase
          .from("Users")
          .select("email")
          .in("role", ["employee", "leader"])
          .eq("isActive", true);

        if (recErr) throw recErr;

        const total =
          birthdays.length + workAnniversaries.length + marriageAnniversaries.length;
        const subject = `🎊 Today's Celebrations (${total} events)`;
        const html = buildHtml({ birthdays, workAnniversaries, marriageAnniversaries });

        for (const r of (recipients || [])) {
          if (r.email) {
            await sendMail(r.email, subject, "", html);
          }
        }
        console.log(`Celebration email sent to ${recipients.length} users`);
      } catch (err) {
        console.error("Celebration job failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("Celebration job scheduled (12:01 AM IST)");
};
