import { supabase } from "../../config/supabase.js";

export const getLeaderDashboardSummary = async (req, res) => {
  try {
    const leaderId = req.user.id;

    const { data: teams, error: teamErr } = await supabase
      .from("Teams")
      .select("id, members:Users!TeamMembers(id)")
      .eq("leaderId", leaderId);

    if (teamErr) throw teamErr;

    const uniqueMemberIds = new Set((teams || []).flatMap((t) => (t.members || []).map((m) => m.id)));
    const teamMembers = uniqueMemberIds.size;

    const { count: tasksCount } = await supabase
      .from("Tasks")
      .select("*", { count: "exact", head: true })
      .eq("assignedById", leaderId);

    const teamIds = (teams || []).map((t) => t.id);

    let projectsCount = 0;
    if (teamIds.length > 0) {
      const { data: teamProjects } = await supabase
        .from("TeamProjects")
        .select("projectId")
        .in("teamId", teamIds);
      
      const uniqueProjectIds = new Set((teamProjects || []).map((tp) => tp.projectId));
      projectsCount = uniqueProjectIds.size;
    }

    res.status(200).json({
      teamMembers,
      tasksAssigned: tasksCount || 0,
      projectsUnderLeader: projectsCount,
      leaderName: req.user.name,
    });
  } catch (err) {
    console.error("Error fetching leader dashboard summary:", err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};
