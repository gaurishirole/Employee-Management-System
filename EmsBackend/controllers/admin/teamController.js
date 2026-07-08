import { supabase } from "../../config/supabase.js";

export const getAllTeams = async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from("Teams")
      .select(`
        *,
        leader:Users!leaderId(id, name, email),
        members:Users!TeamMembers(id, name, email),
        projects:Projects!TeamProjects(id, name)
      `);

    if (error) throw error;
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams", error: err.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, leader, leaderId, members, memberIds, projects, projectIds } = req.body;
    const actualLeaderId = leaderId || leader;
    const actualMembers = memberIds || members;
    const actualProjects = projectIds || projects;

    const { data: newTeam, error } = await supabase
      .from("Teams")
      .insert({ name, leaderId: actualLeaderId })
      .select()
      .single();

    if (error) throw error;
    const teamId = newTeam.id;

    if (actualMembers && actualMembers.length) {
      const inserts = actualMembers.map((userId) => ({ teamId, userId }));
      await supabase.from("TeamMembers").insert(inserts);
    }
    if (actualProjects && actualProjects.length) {
      const inserts = actualProjects.map((projectId) => ({ teamId, projectId }));
      await supabase.from("TeamProjects").insert(inserts);
    }

    res.status(201).json(newTeam);
  } catch (err) {
    res.status(500).json({ message: "Failed to create team", error: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, leader, leaderId, members, memberIds, projects, projectIds } = req.body;
    const actualLeaderId = leaderId || leader;
    const actualMembers = memberIds || members;
    const actualProjects = projectIds || projects;

    const { data: team, error: updErr } = await supabase
      .from("Teams")
      .update({ name, leaderId: actualLeaderId })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Update members
    if (actualMembers) {
      await supabase.from("TeamMembers").delete().eq("teamId", id);
      if (actualMembers.length) {
        const inserts = actualMembers.map((userId) => ({ teamId: id, userId }));
        await supabase.from("TeamMembers").insert(inserts);
      }
    }

    // Update projects
    if (actualProjects) {
      await supabase.from("TeamProjects").delete().eq("teamId", id);
      if (actualProjects.length) {
        const inserts = actualProjects.map((projectId) => ({ teamId: id, projectId }));
        await supabase.from("TeamProjects").insert(inserts);
      }
    }

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ message: "Failed to update team", error: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: team, error } = await supabase
      .from("Teams")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete team", error: err.message });
  }
};
