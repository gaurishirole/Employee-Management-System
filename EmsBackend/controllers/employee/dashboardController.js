import { supabase } from "../../config/supabase.js";
import { getIndiaDayRange } from "../helpers.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all leaves for the employee
    const { data: leaves, error: leaveErr } = await supabase
      .from("Leaves")
      .select("*")
      .eq("userId", userId)
      .order("appliedAt", { ascending: false });

    if (leaveErr) throw leaveErr;

    let leavesUtilized = 0;
    let pendingLeavesCount = 0;
    let approvedLeavesCount = 0;
    let rejectedLeavesCount = 0;

    (leaves || []).forEach((l) => {
      if (l.status === "Approved") {
        leavesUtilized += l.totalDays || 0;
        approvedLeavesCount++;
      } else if (l.status === "Pending") {
        pendingLeavesCount++;
      } else if (l.status === "Rejected") {
        rejectedLeavesCount++;
      }
    });

    // 2. Fetch all tasks assigned to the employee
    const { data: tasks, error: taskErr } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedBy:Users!assignedById(id, name, email),
        project:Projects!projectId(id, name)
      `)
      .eq("assignedToId", userId)
      .order("createdAt", { ascending: false });

    if (taskErr) throw taskErr;

    let tasksFinished = 0;
    let tasksPending = 0;
    let tasksInProgress = 0;

    (tasks || []).forEach((t) => {
      if (t.status === "Completed") {
        tasksFinished++;
      } else if (t.status === "In Progress") {
        tasksInProgress++;
      } else {
        tasksPending++;
      }
    });

    // 3. Fetch active projects assigned to employee's teams
    const { data: userTeams, error: utErr } = await supabase
      .from("TeamMembers")
      .select("teamId")
      .eq("userId", userId);

    if (utErr) throw utErr;
    const teamIds = (userTeams || []).map((t) => t.teamId);

    let activeProjectsCount = 0;
    let projects = [];
    if (teamIds.length > 0) {
      const { data: teamProjects } = await supabase
        .from("TeamProjects")
        .select("projectId")
        .in("teamId", teamIds);
      
      const projectIds = (teamProjects || []).map((tp) => tp.projectId);
      if (projectIds.length > 0) {
        const { data: projs } = await supabase
          .from("Projects")
          .select("*")
          .in("id", projectIds);
        
        projects = projs || [];
        activeProjectsCount = projects.filter((p) => p.status === "In Progress").length;
      }
    }

    // 4. Fetch today's attendance status
    const now = new Date();
    const { start: todayStart } = getIndiaDayRange(now);
    const todayStr = todayStart.toISOString().split("T")[0];

    const { data: todayAttendance } = await supabase
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
      employeeName: req.user.name,
      leavesUtilized,
      pendingRequestsCount: pendingLeavesCount,
      tasksFinished,
      activeProjectsCount,
      todayStatus,
      taskDistribution: {
        pending: tasksPending,
        inProgress: tasksInProgress,
        completed: tasksFinished,
      },
      leaveAllocation: {
        approved: approvedLeavesCount,
        pending: pendingLeavesCount,
        rejected: rejectedLeavesCount,
      },
      activeTasks: (tasks || []).filter((t) => t.status !== "Completed").slice(0, 5),
      recentLeaves: (leaves || []).slice(0, 5),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
