import { supabase } from "../../config/supabase.js";

export const searchEmployeesForEmployee = async (req, res) => {
  try {
    const { query = "" } = req.query;

    if (!query.trim()) {
      return res.status(400).json({ message: "Search query is required to lookup employees" });
    }

    const { data: employees, error } = await supabase
      .from("Users")
      .select("id, name, email, phone, address, position, dateOfBirth, dateOfJoining")
      .in("role", ["employee", "leader"])
      .eq("isActive", true)
      .or(`name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
      .order("name", { ascending: true })
      .limit(25);

    if (error) throw error;

    return res.status(200).json(employees);
  } catch (error) {
    console.error("searchEmployeesForEmployee error:", error);
    return res.status(500).json({ message: "Failed to search employees", error: error.message });
  }
};
