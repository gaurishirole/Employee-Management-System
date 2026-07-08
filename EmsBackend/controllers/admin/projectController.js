import { supabase } from "../../config/supabase.js";

export const getAllProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from("Projects")
      .select(`
        *,
        assignedTeams:Teams!TeamProjects(id, name)
      `);

    if (error) throw error;
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, completion, assignedTeams } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const { data: project, error } = await supabase
      .from("Projects")
      .insert({
        name,
        description,
        startDate,
        endDate,
        status,
        completion,
      })
      .select()
      .single();

    if (error) throw error;
    const projectId = project.id;

    if (assignedTeams && assignedTeams.length) {
      const inserts = assignedTeams.map((teamId) => ({ projectId, teamId }));
      await supabase.from("TeamProjects").insert(inserts);
    }

    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates.name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const cleanUpdates = { ...updates };
    delete cleanUpdates.assignedTeams;

    const { data: project, error: updErr } = await supabase
      .from("Projects")
      .update(cleanUpdates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (updates.assignedTeams) {
      await supabase.from("TeamProjects").delete().eq("projectId", id);
      if (updates.assignedTeams.length) {
        const inserts = updates.assignedTeams.map((teamId) => ({ projectId: id, teamId }));
        await supabase.from("TeamProjects").insert(inserts);
      }
    }

    res.json(project);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: project, error } = await supabase
      .from("Projects")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
