import { supabase } from "../../config/supabase.js";

export const getLeaderProjects = async (req, res) => {
  try {
    const { data: projects, error: projErr } = await supabase
      .from("Projects")
      .select("*, assignedTeams:Teams!TeamProjects(id, name)")
      .order("startDate", { ascending: false });

    if (projErr) throw projErr;

    res.status(200).json(projects);
  } catch (err) {
    console.error("Error fetching leader projects:", err);
    res.status(500).json({ message: "Failed to fetch leader projects." });
  }
};
