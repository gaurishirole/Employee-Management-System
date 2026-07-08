import { supabase } from "../config/supabase.js";

export const createVacancy = async (req, res) => {
  try {
    const { data: vacancy, error } = await supabase
      .from("Vacancies")
      .insert({
        ...req.body,
        createdById: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(vacancy);
  } catch (error) {
    console.error("Error creating vacancy:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getVacancies = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.priorityLevel) {
      filter.priorityLevel = req.query.priorityLevel;
    }

    const { data: vacancies, error } = await supabase
      .from("Vacancies")
      .select(`
        *,
        createdBy:Users!createdById(id, name, role)
      `)
      .match(filter)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    res.json(vacancies);
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateVacancy = async (req, res) => {
  try {
    const { data: vacancy, error } = await supabase
      .from("Vacancies")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!vacancy) return res.status(404).json({ message: "Vacancy not found" });

    res.json(vacancy);
  } catch (error) {
    console.error("Error updating vacancy:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteVacancy = async (req, res) => {
  try {
    const { data: vacancy, error } = await supabase
      .from("Vacancies")
      .delete()
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!vacancy) return res.status(404).json({ message: "Vacancy not found" });
    res.json({ message: "Vacancy deleted" });
  } catch (error) {
    console.error("Error deleting vacancy:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

