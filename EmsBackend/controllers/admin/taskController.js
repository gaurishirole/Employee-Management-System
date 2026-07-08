import { supabase } from "../../config/supabase.js";

export const getDelayedTasksAdmin = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedTo:Users!assignedToId(id, name, email),
        assignedBy:Users!assignedById(id, name),
        project:Projects!projectId(id, name)
      `)
      .order("completedAt", { ascending: false });

    if (error) throw error;

    const delayed = (tasks || []).filter(
      (t) =>
        t.status === "Delayed" ||
        (t.delayCount && t.delayCount > 0) ||
        (t.completedAt && t.deadline && new Date(t.completedAt) > new Date(t.deadline))
    );

    res.json(delayed);
  } catch (err) {
    console.error("Error fetching delayed tasks:", err);
    res.status(500).json({ message: "Failed to fetch delayed tasks" });
  }
};

export const getAllTasksAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== "All") filter.status = status;

    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select(`
        *,
        assignedTo:Users!assignedToId(id, name, email),
        assignedBy:Users!assignedById(id, name, email),
        project:Projects!projectId(id, name)
      `)
      .match(filter)
      .order("assignedAt", { ascending: false });

    if (error) throw error;

    let result = tasks || [];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(q)) ||
          (t.project?.name && t.project.name.toLowerCase().includes(q)) ||
          (t.assignedBy?.name && t.assignedBy.name.toLowerCase().includes(q))
      );
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching all tasks (admin):", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
