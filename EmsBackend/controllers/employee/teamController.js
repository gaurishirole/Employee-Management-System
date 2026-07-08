import { supabase } from "../../config/supabase.js";

export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: userTeams, error: utErr } = await supabase
      .from("TeamMembers")
      .select("teamId")
      .eq("userId", userId);

    if (utErr) throw utErr;
    const teamIds = (userTeams || []).map((ut) => ut.teamId);

    if (!teamIds.length) {
      return res.status(200).json([]);
    }

    const { data: teams, error: teamsErr } = await supabase
      .from("Teams")
      .select(`
        *,
        leader:Users!leaderId(id, name, email),
        members:Users!TeamMembers(id, name, email)
      `)
      .in("id", teamIds);

    if (teamsErr) throw teamsErr;

    res.status(200).json(teams);
  } catch (err) {
    console.error("Error fetching employee teams:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};
