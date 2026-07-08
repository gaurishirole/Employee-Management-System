import { supabase } from "../../config/supabase.js";
import { generateAndSendSalarySlip, generateSalarySlipBuffer } from "../../utils/salarySlipGenerator.js";

const calculateSalaryDetails = async (userId, monthName, year) => {
  const { data: user, error: findErr } = await supabase
    .from("Users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (findErr || !user) throw new Error("User not found");

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const monthIndex = months.indexOf(monthName.toLowerCase());
  if (monthIndex === -1) throw new Error("Invalid month");

  const monthStartStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const tempEnd = new Date(year, monthIndex + 1, 0);
  const monthEndStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(tempEnd.getDate()).padStart(
    2,
    "0"
  )}`;

  const daysInMonth = tempEnd.getDate();

  const { data: attendances } = await supabase
    .from("Attendances")
    .select("*")
    .eq("userId", userId)
    .gte("date", monthStartStr)
    .lte("date", monthEndStr);

  const { data: leaves } = await supabase
    .from("Leaves")
    .select("*")
    .eq("userId", userId)
    .eq("status", "Approved")
    .lte("fromDate", monthEndStr)
    .gte("toDate", monthStartStr);

  const { data: holidays } = await supabase
    .from("Holidays")
    .select("*")
    .gte("date", monthStartStr)
    .lte("date", monthEndStr);

  const holidaySet = new Set();
  const weekendSet = new Set();

  let workingDays = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, monthIndex, i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendSet.add(i);
    } else {
      workingDays++;
    }
  }

  (holidays || []).forEach((holiday) => {
    const day = new Date(holiday.date).getDate();
    if (!weekendSet.has(day)) {
      holidaySet.add(day);
      workingDays--;
    }
  });

  let presentDays = 0;
  let absentDays = 0;
  let overtimeDays = 0;

  const attendanceMap = new Map((attendances || []).map((a) => [new Date(a.date).getDate(), a]));

  for (let i = 1; i <= daysInMonth; i++) {
    if (weekendSet.has(i) || holidaySet.has(i)) {
      continue;
    }

    const att = attendanceMap.get(i);
    if (att) {
      if (att.status === "Present") {
        presentDays++;
      } else if (att.status === "Absent") {
        absentDays++;
      } else if (att.status === "Over-time") {
        overtimeDays++;
        presentDays++;
      }
    } else {
      absentDays++;
    }
  }

  let leaveDays = 0;
  (leaves || []).forEach((leave) => {
    const leaveStart = new Date(leave.fromDate);
    const leaveEnd = new Date(leave.toDate);

    for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === monthIndex && d.getFullYear() === year) {
        const dayOfMonth = d.getDate();
        if (!weekendSet.has(dayOfMonth) && !holidaySet.has(dayOfMonth)) {
          leaveDays++;
        }
      }
    }
  });

  const baseSalary = Number(user.salary) || 0;
  const dailyRate = baseSalary / workingDays;
  const calculatedSalary = Math.round(dailyRate * presentDays * 100) / 100;

  return {
    baseSalary,
    daysInMonth,
    workingDays,
    presentDays,
    absentDays,
    leaveDays,
    overtimeDays,
    dailyRate: Math.round(dailyRate * 100) / 100,
    calculatedSalary,
    weekends: weekendSet.size,
    holidays: holidaySet.size,
  };
};

export const calculateSalary = async (req, res) => {
  try {
    const { userId, month, year } = req.body;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!month) return res.status(400).json({ message: "month is required" });

    const monthNormalized = String(month).trim().toLowerCase();
    const numericYear = Number(year || new Date().getFullYear());

    if (!numericYear || numericYear < 2000 || numericYear > 2100) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const details = await calculateSalaryDetails(userId, monthNormalized, numericYear);
    res.json(details);
  } catch (err) {
    console.error("Error calculating salary:", err);
    res.status(500).json({ message: "Failed to calculate salary", error: err.message });
  }
};

export const getAllSalaries = async (req, res) => {
  try {
    const { data: records, error } = await supabase
      .from("Salaries")
      .select("*, user:Users!userId(id, name, email)")
      .order("creditedOn", { ascending: false });

    if (error) throw error;
    res.json(records);
  } catch (err) {
    console.error("Error fetching salaries:", err);
    res.status(500).json({ message: "Failed to fetch salary history" });
  }
};

export const previewSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: record, error } = await supabase
      .from("Salaries")
      .select("*, user:Users!userId(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !record) return res.status(404).json({ message: "Salary record not found" });

    const salaryDetails = await calculateSalaryDetails(record.user.id, record.month, record.year);
    const pdfBuffer = await generateSalarySlipBuffer(record.user, salaryDetails, record);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Salary_Slip_${record.month}_${record.year}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error previewing salary slip:", err);
    res.status(500).json({ message: "Failed to generate preview", error: err.message });
  }
};

export const creditSalary = async (req, res) => {
  try {
    const { personal, userId, bonus, bonusAllocation, month, year, presentDay, presentDays } = req.body;

    const targetUserId = personal || userId;
    if (!targetUserId) return res.status(400).json({ message: "userId / personal is required" });
    if (!month) return res.status(400).json({ message: "month is required" });

    const monthNormalized = String(month).trim().toLowerCase();
    const numericYear = Number(year || new Date().getFullYear());
    if (!numericYear || numericYear < 2000 || numericYear > 2100) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", targetUserId)
      .maybeSingle();

    if (findErr || !user) return res.status(404).json({ message: "User not found" });

    const { data: existing } = await supabase
      .from("Salaries")
      .select("id")
      .eq("userId", targetUserId)
      .eq("month", monthNormalized)
      .eq("year", numericYear)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Salary already credited for this month and year" });
    }

    const salaryDetails = await calculateSalaryDetails(targetUserId, monthNormalized, numericYear);
    
    // Override calculate details if custom present days is provided
    const rawPresentDays = presentDay !== undefined ? presentDay : presentDays;
    if (rawPresentDays !== undefined && rawPresentDays !== null) {
      const pDays = Number(rawPresentDays);
      salaryDetails.presentDays = pDays;
      salaryDetails.absentDays = Math.max(0, salaryDetails.workingDays - pDays);
      salaryDetails.calculatedSalary = Math.round(salaryDetails.dailyRate * pDays * 100) / 100;
    }

    const baseSalary = salaryDetails.calculatedSalary;
    const rawBonus = bonusAllocation !== undefined ? bonusAllocation : bonus;
    const bonusNum = Number(rawBonus || 0);
    const totalCredited = baseSalary + bonusNum;

    const { data: record, error: insErr } = await supabase
      .from("Salaries")
      .insert({
        userId: targetUserId,
        baseSalary,
        bonus: bonusNum,
        totalCredited,
        month: monthNormalized,
        year: numericYear,
        creditedOn: new Date().toISOString(),
        isCredited: true,
        presentDays: salaryDetails.presentDays,
        absentDays: salaryDetails.absentDays,
        dailyRate: salaryDetails.dailyRate,
        daysInMonth: salaryDetails.daysInMonth,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    const { data: populated } = await supabase
      .from("Salaries")
      .select("*, user:Users!userId(id, name, email)")
      .eq("id", record.id)
      .maybeSingle();

    try {
      await generateAndSendSalarySlip(user, salaryDetails, record);
    } catch (emailErr) {
      console.error("Salary credited but failed to send email:", emailErr);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error crediting salary:", err);
    res.status(500).json({ message: "Failed to credit salary", error: err.message });
  }
};
