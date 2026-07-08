import { supabase } from "../../config/supabase.js";
import { createNotification } from "../notificationController.js";

export const assignTask = async (req, res) => {
  try {
    const leaderId = req.user.id;
    const { title, description, assignedTo, assignedToId, projectId, deadline, dueDate } = req.body;

    const targetAssignedTo = assignedTo ? Number(assignedTo) : (assignedToId ? Number(assignedToId) : undefined);
    const targetProjectId = projectId ? Number(projectId) : undefined;
    const targetDeadline = deadline || dueDate;

    if (!targetAssignedTo || !targetProjectId) {
      return res.status(400).json({ message: "Project and Assignee are required" });
    }

    const { data: project } = await supabase
      .from("Projects")
      .select("*, assignedTeams:Teams!TeamProjects(id)")
      .eq("id", targetProjectId)
      .maybeSingle();

    if (!project) return res.status(404).json({ message: "Project not found" });

    const assignedTeamIds = (project.assignedTeams || []).map((t) => t.id);

    if (assignedTeamIds.length === 0) {
      return res.status(403).json({
        message: "You are not managing this project or the employee is not part of your team",
      });
    }

    if (req.user.role !== "admin") {
      const { data: leaderTeam, error: ltErr } = await supabase
        .from("Teams")
        .select(`
          id,
          members:Users!TeamMembers(id)
        `)
        .eq("leaderId", leaderId)
        .in("id", assignedTeamIds)
        .maybeSingle();

      if (ltErr || !leaderTeam) {
        return res.status(403).json({
          message: "You are not managing this project or the employee is not part of your team",
        });
      }

      const isMember = (leaderTeam.members || []).some((m) => m.id === targetAssignedTo);
      if (!isMember) {
        return res.status(403).json({
          message: "You are not managing this project or the employee is not part of your team",
        });
      }
    } else {
      const { data: teams, error: tErr } = await supabase
        .from("Teams")
        .select(`
          id,
          members:Users!TeamMembers(id)
        `)
        .in("id", assignedTeamIds);

      if (tErr || !teams) {
        return res.status(403).json({
          message: "The employee is not part of any team assigned to this project",
        });
      }

      const isMember = teams.some((t) => (t.members || []).some((m) => m.id === targetAssignedTo));
      if (!isMember) {
        return res.status(403).json({
          message: "The employee is not part of any team assigned to this project",
        });
      }
    }

    const taskData = {
      description,
      title,
      assignedToId: targetAssignedTo,
      assignedById: leaderId,
      projectId: targetProjectId,
    };

    if (targetDeadline) {
      const dl = new Date(targetDeadline);
      if (isNaN(dl.getTime())) {
        return res.status(400).json({ message: "Invalid deadline" });
      }
      taskData.deadline = dl.toISOString();
    } else {
      return res.status(400).json({ message: "Deadline is required" });
    }

    let task;
    let taskErr;

    // Try inserting with title
    const tryInsert = await supabase
      .from("Tasks")
      .insert(taskData)
      .select()
      .single();

    if (tryInsert.error) {
      // If title column does not exist (undefined_column postgres code '42703'), retry without title
      if (tryInsert.error.code === '42703' || (tryInsert.error.message && tryInsert.error.message.includes('title'))) {
        const fallbackTaskData = { ...taskData };
        delete fallbackTaskData.title;
        fallbackTaskData.description = title ? `${title}\n\n${description}` : description;
        
        const fallbackInsert = await supabase
          .from("Tasks")
          .insert(fallbackTaskData)
          .select()
          .single();

        task = fallbackInsert.data;
        taskErr = fallbackInsert.error;
      } else {
        taskErr = tryInsert.error;
      }
    } else {
      task = tryInsert.data;
    }

    if (taskErr) throw taskErr;

    await createNotification({
      message: `New task assigned: ${title || description}${targetDeadline ? ` (Deadline: ${new Date(targetDeadline).toLocaleDateString()})` : ""}`,
      role: "employee",
      recipient: targetAssignedTo,
      triggeredBy: leaderId,
    });

    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasksAssignedByLeader = async (req, res) => {
  try {
    const leaderId = req.user.id;
    let query = supabase
      .from("Tasks")
      .select(`
        *,
        assignedTo:Users!assignedToId(id, name, email),
        project:Projects!projectId(id, name)
      `);

    if (req.user.role !== "admin") {
      query = query.eq("assignedById", leaderId);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};
