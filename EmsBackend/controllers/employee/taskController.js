import { supabase } from "../../config/supabase.js";
import { createNotification } from "../notificationController.js";

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedBy:Users!assignedById(id, name, email),
        project:Projects!projectId(id, name)
      `)
      .eq("assignedToId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const { data: task, error: findErr } = await supabase
      .from("Tasks")
      .select("*")
      .eq("id", taskId)
      .eq("assignedToId", userId)
      .maybeSingle();

    if (findErr || !task) return res.status(404).json({ message: "Task not found" });

    const updatedFields = { status };
    if (status === "Completed") {
      updatedFields.completedAt = new Date().toISOString();
      if (req.body.completionDescription) {
        updatedFields.completionDescription = req.body.completionDescription;
      }
      if (req.body.deployedLink) {
        updatedFields.deployedLink = req.body.deployedLink;
      }
    } else {
      updatedFields.completedAt = null;
      updatedFields.completionDescription = null;
      updatedFields.deployedLink = null;
    }

    const { data: updatedTask, error: updErr } = await supabase
      .from("Tasks")
      .update(updatedFields)
      .eq("id", taskId)
      .select()
      .single();

    if (updErr) throw updErr;

    const { data: taskWithAssigner } = await supabase
      .from("Tasks")
      .select("*, assignedBy:Users!assignedById(id, role)")
      .eq("id", taskId)
      .maybeSingle();

    if (taskWithAssigner && taskWithAssigner.assignedBy) {
      await createNotification({
        message: `${req.user.name} updated task "${task.description}" status to ${status}`,
        role: "leader",
        recipient: taskWithAssigner.assignedBy.id,
        triggeredBy: userId,
      });
    }

    res.status(200).json({ message: "Task status updated", task: updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};
