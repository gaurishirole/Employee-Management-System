import { supabase } from "../../config/supabase.js";

export const searchEmployeesForLeader = async (req, res) => {
  try {
    const { query = "" } = req.query;

    if (!query.trim()) {
      return res.status(400).json({ message: "Search query is required to lookup employees" });
    }

    const leaderId = req.user.id;
    const { data: teams, error: teamErr } = await supabase
      .from("Teams")
      .select("members:Users!TeamMembers(id)")
      .eq("leaderId", leaderId);

    if (teamErr) throw teamErr;

    const teamMemberIds = (teams || []).flatMap((team) => (team.members || []).map((member) => member.id));

    if (!teamMemberIds.length) {
      return res.status(200).json([]);
    }

    const { data: employees, error: empErr } = await supabase
      .from("Users")
      .select("id, name, email, phone, address, position, dateOfBirth, dateOfJoining")
      .in("id", teamMemberIds)
      .eq("isActive", true)
      .or(`name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
      .order("name", { ascending: true })
      .limit(25);

    if (empErr) throw empErr;

    return res.status(200).json(employees);
  } catch (error) {
    console.error("searchEmployeesForLeader error:", error);
    return res.status(500).json({ message: "Failed to search employees", error: error.message });
  }
};
