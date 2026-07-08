import { supabase } from "../../config/supabase.js";

export const getProjectsForEmployee = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const { data: userTeams, error: utErr } = await supabase
      .from("TeamMembers")
      .select("teamId")
      .eq("userId", employeeId);

    if (utErr) throw utErr;
    const teamIds = (userTeams || []).map((ut) => ut.teamId);

    if (!teamIds.length) {
      return res.status(200).json([]);
    }

    const { data: teamProjects, error: tpErr } = await supabase
      .from("TeamProjects")
      .select("projectId")
      .in("teamId", teamIds);

    if (tpErr) throw tpErr;
    const projectIds = (teamProjects || []).map((tp) => tp.projectId);

    if (!projectIds.length) {
      return res.status(200).json([]);
    }

    const { data: projects, error: projErr } = await supabase
      .from("Projects")
      .select("*, assignedTeams:Teams!TeamProjects(id, name)")
      .in("id", projectIds);

    if (projErr) throw projErr;

    // Filter assigned teams
    const filteredProjects = projects.map((proj) => ({
      ...proj,
      assignedTeams: (proj.assignedTeams || []).filter((t) => teamIds.includes(t.id)),
    }));

    res.status(200).json(filteredProjects);
  } catch (err) {
    console.error("Failed to fetch employee projects:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};
