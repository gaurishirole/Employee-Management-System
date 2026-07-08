import { supabase } from "../../config/supabase.js";
import { getIndiaDayRange } from "../helpers.js";

export const getAttendanceReport = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("name, email, dateOfJoining")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !user) return res.status(404).json({ message: "User not found" });

    const startBase = startDate ? new Date(startDate) : new Date(user.dateOfJoining || Date.now());
    const endBase = endDate ? new Date(endDate) : new Date();

    const { start: rStart } = getIndiaDayRange(new Date(startBase));
    const { end: rEnd } = getIndiaDayRange(new Date(endBase));

    const rStartStr = rStart.toISOString().split("T")[0];
    const rEndStr = rEnd.toISOString().split("T")[0];

    const [attendancesRes, holidaysRes, leavesRes] = await Promise.all([
      supabase.from("Attendances").select("*").eq("userId", userId).gte("date", rStartStr).lte("date", rEndStr),
      supabase.from("Holidays").select("*").gte("date", rStartStr).lte("date", rEndStr),
      supabase.from("Leaves").select("*").eq("userId", userId).eq("status", "Approved").lte("fromDate", rEndStr).gte("toDate", rStartStr),
    ]);

    const attendances = attendancesRes.data || [];
    const holidays = holidaysRes.data || [];
    const leaves = leavesRes.data || [];

    const attMap = new Map();
    attendances.forEach((a) => {
      attMap.set(a.date, a);
    });

    const holidaySet = new Set(holidays.map((h) => h.date));

    const leaveSet = new Set();
    leaves.forEach((lv) => {
      const from = new Date(Math.max(new Date(lv.fromDate).getTime(), rStart.getTime()));
      const to = new Date(Math.min(new Date(lv.toDate).getTime(), rEnd.getTime()));
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        leaveSet.add(d.toISOString().split("T")[0]);
      }
    });

    let csv = "Date,Name,Email,Status,CheckIn,CheckOut,Hours\n";
    for (let cursor = new Date(rStart); cursor <= rEnd; cursor.setDate(cursor.getDate() + 1)) {
      const key = cursor.toISOString().split("T")[0];
      const att = attMap.get(key);

      let status = "Absent";
      let checkIn = "";
      let checkOut = "";
      let hours = "";

      if (holidaySet.has(key)) {
        if (att && att.checkIn) {
          status = "Over-time";
          if (att.checkIn) checkIn = new Date(att.checkIn).toISOString();
          if (att.checkOut) checkOut = new Date(att.checkOut).toISOString();
        } else {
          status = "Holiday";
        }
      } else if (leaveSet.has(key)) {
        status = "Leave";
      } else if (att && att.checkIn && att.checkOut) {
        status = "Present";
        checkIn = new Date(att.checkIn).toISOString();
        checkOut = new Date(att.checkOut).toISOString();
      } else {
        status = "Absent";
        if (att && att.checkIn) checkIn = new Date(att.checkIn).toISOString();
        if (att && att.checkOut) checkOut = new Date(att.checkOut).toISOString();
      }

      if (checkIn && checkOut) {
        try {
          const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
          hours = (diffMs / 3600000).toFixed(2);
        } catch (e) {
          hours = "";
        }
      }

      const name = user.name || "";
      const email = user.email || "";

      csv += `${key},"${name}","${email}",${status},${checkIn},${checkOut},${hours}\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="attendance_report.csv"');
    res.send(csv);
  } catch (err) {
    console.error("Error generating attendance report:", err);
    res.status(500).json({ message: "Failed to generate attendance report" });
  }
};

export const getTaskReport = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ message: "userId, startDate, and endDate are required" });
    }

    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedTo:Users!assignedToId(name, email),
        assignedBy:Users!assignedById(name),
        project:Projects!projectId(name)
      `)
      .eq("assignedToId", userId)
      .gte("assignedAt", new Date(startDate).toISOString())
      .lte("assignedAt", new Date(endDate).toISOString())
      .order("assignedAt", { ascending: true });

    if (error) throw error;

    let csv = "Assigned At,Description,Status,Deadline,Project,Assigned By,Delay Count\n";
    (tasks || []).forEach((task) => {
      const assignedAt = new Date(task.assignedAt).toISOString().split("T")[0];
      const deadline = task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "";
      const project = task.project ? task.project.name : "";
      const assignedBy = task.assignedBy ? task.assignedBy.name : "";
      csv += `"${assignedAt}","${task.description}","${task.status}","${deadline}","${project}","${assignedBy}",${task.delayCount}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="task_report.csv"');
    res.send(csv);
  } catch (err) {
    console.error("Error generating task report:", err);
    res.status(500).json({ message: "Failed to generate task report" });
  }
};

export const getDelayReport = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ message: "userId, startDate, and endDate are required" });
    }

    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedTo:Users!assignedToId(name, email),
        assignedBy:Users!assignedById(name),
        project:Projects!projectId(name)
      `)
      .eq("assignedToId", userId)
      .gt("delayCount", 0)
      .gte("assignedAt", new Date(startDate).toISOString())
      .lte("assignedAt", new Date(endDate).toISOString())
      .order("delayCount", { ascending: false })
      .order("assignedAt", { ascending: true });

    if (error) throw error;

    let csv = "Assigned At,Status,Deadline,Delay Count,Delay History,Project,Assigned By\n";
    (tasks || []).forEach((task) => {
      const assignedAt = new Date(task.assignedAt).toISOString().split("T")[0];
      const deadline = task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "";
      const project = task.project ? task.project.name : "";
      const assignedBy = task.assignedBy ? task.assignedBy.name : "";
      const delayHistoryStr = task.delayHistory
        ? task.delayHistory.map((h) => `${new Date(h.date).toISOString().split("T")[0]}: ${h.reason}`).join("; ")
        : "";
      csv += `"${assignedAt}","${task.status}","${deadline}",${task.delayCount},"${delayHistoryStr}","${project}","${assignedBy}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="delay_report.csv"');
    res.send(csv);
  } catch (err) {
    console.error("Error generating delay report:", err);
    res.status(500).json({ message: "Failed to generate delay report" });
  }
};

export const getUserReportData = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("id, name, email, role, phone, address, position, salary, dateOfBirth, dateOfJoining")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startBase = startDate ? new Date(startDate) : new Date(user.dateOfJoining || Date.now());
    const endBase = endDate ? new Date(endDate) : new Date();
    const { start: uStart } = getIndiaDayRange(new Date(startBase));
    const { end: uEnd } = getIndiaDayRange(new Date(endBase));

    const uStartStr = uStart.toISOString().split("T")[0];
    const uEndStr = uEnd.toISOString().split("T")[0];

    const [rawAttendancesRes, rawHolidaysRes, rawLeavesRes] = await Promise.all([
      supabase.from("Attendances").select("*").eq("userId", userId).gte("date", uStartStr).lte("date", uEndStr).order("date", { ascending: true }),
      supabase.from("Holidays").select("*").gte("date", uStartStr).lte("date", uEndStr),
      supabase.from("Leaves").select("*").eq("userId", userId).lte("fromDate", uEndStr).gte("toDate", uStartStr).order("fromDate", { ascending: false }),
    ]);

    const rawAttendances = rawAttendancesRes.data || [];
    const rawHolidays = rawHolidaysRes.data || [];
    const rawLeaves = rawLeavesRes.data || [];

    const attMap2 = new Map();
    rawAttendances.forEach((a) => {
      attMap2.set(a.date, a);
    });

    const holidaySet2 = new Set(rawHolidays.map((h) => h.date));

    const leaveSet2 = new Set();
    rawLeaves.forEach((lv) => {
      const from = new Date(Math.max(new Date(lv.fromDate).getTime(), uStart.getTime()));
      const to = new Date(Math.min(new Date(lv.toDate).getTime(), uEnd.getTime()));
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        leaveSet2.add(d.toISOString().split("T")[0]);
      }
    });

    const dayList = [];
    for (let cursor = new Date(uStart); cursor <= uEnd; cursor.setDate(cursor.getDate() + 1)) {
      const key = cursor.toISOString().split("T")[0];
      const rec = attMap2.get(key);
      let status = "Absent";
      let checkIn = null;
      let checkOut = null;
      let hours = null;

      if (holidaySet2.has(key)) {
        if (rec && rec.checkIn) {
          status = "Over-time";
          checkIn = rec.checkIn;
          checkOut = rec.checkOut;
        } else {
          status = "Holiday";
        }
      } else if (leaveSet2.has(key)) {
        status = "Leave";
      } else if (rec && rec.checkIn && rec.checkOut) {
        status = "Present";
        checkIn = rec.checkIn;
        checkOut = rec.checkOut;
      } else {
        status = "Absent";
        if (rec) {
          if (rec.checkIn) checkIn = rec.checkIn;
          if (rec.checkOut) checkOut = rec.checkOut;
        }
      }

      if (checkIn && checkOut) {
        try {
          const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
          hours = +(diffMs / 3600000).toFixed(2);
        } catch (e) {
          hours = null;
        }
      }

      dayList.push({ date: key, status, checkIn, checkOut, hours });
    }

    const attendances = dayList.reverse();
    const leaves = rawLeaves;

    let projects = [];
    if (user.role === "leader") {
      const { data: teamsLed } = await supabase.from("Teams").select("id").eq("leaderId", userId);
      const teamIds = (teamsLed || []).map((t) => t.id);

      if (teamIds.length > 0) {
        const { data: teamProjects } = await supabase.from("TeamProjects").select("projectId").in("teamId", teamIds);
        const projectIds = (teamProjects || []).map((tp) => tp.projectId);

        if (projectIds.length > 0) {
          const { data: projs } = await supabase.from("Projects").select("name, status, description, startDate, endDate").in("id", projectIds);
          projects = projs || [];
        }
      }
    } else {
      const { data: teamsMember } = await supabase.from("TeamMembers").select("teamId").eq("userId", userId);
      const teamIds = (teamsMember || []).map((t) => t.teamId);

      if (teamIds.length > 0) {
        const { data: teamProjects } = await supabase.from("TeamProjects").select("projectId").in("teamId", teamIds);
        const projectIds = (teamProjects || []).map((tp) => tp.projectId);

        if (projectIds.length > 0) {
          const { data: projs } = await supabase.from("Projects").select("name, status, description, startDate, endDate").in("id", projectIds);
          projects = projs || [];
        }
      }
    }

    let tasks = [];
    if (user.role === "leader") {
      let taskQuery = supabase.from("Tasks").select(`
        *,
        project:Projects!projectId(name),
        assignedBy:Users!assignedById(name),
        assignedTo:Users!assignedToId(name)
      `).eq("assignedById", userId);

      if (startDate && endDate) {
        taskQuery = taskQuery.gte("assignedAt", new Date(startDate).toISOString()).lte("assignedAt", new Date(endDate).toISOString());
      }
      const { data } = await taskQuery.order("assignedAt", { ascending: false });
      tasks = data || [];
    } else {
      let taskQuery = supabase.from("Tasks").select(`
        *,
        project:Projects!projectId(name),
        assignedBy:Users!assignedById(name)
      `).eq("assignedToId", userId);

      if (startDate && endDate) {
        taskQuery = taskQuery.gte("assignedAt", new Date(startDate).toISOString()).lte("assignedAt", new Date(endDate).toISOString());
      }
      const { data } = await taskQuery.order("assignedAt", { ascending: false });
      tasks = data || [];
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const delayedTasks = tasks.filter((t) => t.delayCount > 0).length;
    const totalAttendance = attendances.length;
    const presentDays = attendances.filter((a) => a.status === "Present" || a.status === "Over-time").length;

    const performanceSummary = {
      totalTasks,
      completedTasks,
      delayedTasks,
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      totalAttendance,
      presentDays,
      attendanceRate: totalAttendance > 0 ? ((presentDays / totalAttendance) * 100).toFixed(1) : 0,
      totalLeaves: leaves.length,
    };

    res.json({
      user,
      attendances,
      leaves,
      projects,
      tasks,
      performanceSummary,
    });
  } catch (err) {
    console.error("Error fetching user report data:", err);
    res.status(500).json({ message: "Failed to fetch user report data" });
  }
};
