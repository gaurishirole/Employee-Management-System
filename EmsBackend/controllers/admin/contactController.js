import { supabase } from "../../config/supabase.js";

export const searchEmployeesForAdmin = async (req, res) => {
  try {
    const { query = "" } = req.query;

    if (!query.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const { data: employees, error } = await supabase
      .from("Users")
      .select("id, name, email, phone, address, position, dateOfBirth, dateOfJoining, role")
      .eq("isActive", true)
      .or(`name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
      .order("name", { ascending: true })
      .limit(50);

    if (error) throw error;

    return res.status(200).json(employees);
  } catch (error) {
    console.error("searchEmployeesForAdmin error:", error);
    return res.status(500).json({ message: "Failed to search employees", error: error.message });
  }
};
