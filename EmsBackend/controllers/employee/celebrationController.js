import { supabase } from "../../config/supabase.js";

const getTodayISTParts = () => {
  const istDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  return {
    day: istDate.getDate(),
    month: istDate.getMonth() + 1,
  };
};

const fetchCelebrationsForField = async (field, day, month) => {
  const { data: users, error } = await supabase
    .from("Users")
    .select(`id, name, email, role, ${field}, dateOfJoining`)
    .not(field, "is", null)
    .eq("isActive", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return users.filter((user) => {
    const val = user[field];
    if (!val) return false;
    const dateVal = new Date(val);
    return dateVal.getDate() === day && (dateVal.getMonth() + 1) === month;
  });
};

export const getTodayCelebrations = async (_req, res) => {
  try {
    const { day, month } = getTodayISTParts();

    const [birthdays, workAnniversaries] = await Promise.all([
      fetchCelebrationsForField("dateOfBirth", day, month),
      fetchCelebrationsForField("dateOfJoining", day, month),
    ]);

    res.status(200).json({
      birthdays: birthdays.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        role: person.role,
        date: person.dateOfBirth,
      })),
      workAnniversaries: workAnniversaries.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        role: person.role,
        date: person.dateOfJoining,
      })),
      marriageAnniversaries: [],
    });
  } catch (error) {
    console.error("getTodayCelebrations error:", error);
    res.status(500).json({ message: "Failed to fetch today's celebrations" });
  }
};
