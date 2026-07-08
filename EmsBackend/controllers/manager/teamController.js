import { supabase } from "../../config/supabase.js";

export const getLeaderTeams = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { data: teams, error } = await supabase
      .from("Teams")
      .select("*, members:Users!TeamMembers(id, name, email)")
      .eq("leaderId", leaderId);

    if (error) throw error;
    res.status(200).json(teams);
  } catch (err) {
    console.error("Error fetching leader's teams:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

export const getTeamMembersByProject = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { projectId } = req.query;

    if (!projectId) {
      let query = supabase
        .from("Teams")
        .select("*, members:Users!TeamMembers(id, name, email)");

      if (req.user.role !== "admin") {
        query = query.eq("leaderId", leaderId);
      }

      const { data: teams, error } = await query;

      if (error) throw error;
      const members = teams.flatMap((t) => t.members || []);
      const memberMap = new Map();
      members.forEach((m) => memberMap.set(String(m.id), m));
      return res.status(200).json(Array.from(memberMap.values()));
    }

    const { data: project } = await supabase
      .from("Projects")
      .select("*, assignedTeams:Teams!TeamProjects(id)")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) return res.status(404).json({ message: "Project not found" });

    const assignedTeamIds = (project.assignedTeams || []).map((t) => t.id);

    if (assignedTeamIds.length === 0) {
      return res.status(200).json([]);
    }

    let query = supabase
      .from("Teams")
      .select("*, members:Users!TeamMembers(id, name, email)")
      .in("id", assignedTeamIds);

    if (req.user.role !== "admin") {
      query = query.eq("leaderId", leaderId);
    }

    const { data: teams, error } = await query;

    if (error) throw error;

    const members = teams.flatMap((t) => t.members || []);
    // Unique members
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(String(m.id), m));

    res.status(200).json(Array.from(memberMap.values()));
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};
