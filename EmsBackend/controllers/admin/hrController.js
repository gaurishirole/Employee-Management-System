import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase.js";
import { parseDateDMY } from "../helpers.js";

export const getAllHRsAdmin = async (req, res) => {
  try {
    const { data: hrs, error } = await supabase
      .from("Users")
      .select("*")
      .eq("role", "hr");

    if (error) throw error;
    res.json(hrs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch HRs" });
  }
};

export const createHRAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address, position, salary, dateOfBirth, dob, leaveAllowance } = req.body;
    const { data: existing } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hrData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      position: position || null,
      role: "hr",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (salary !== undefined && salary !== "") {
      hrData.salary = Number(salary);
    }
    if (leaveAllowance !== undefined && leaveAllowance !== "") {
      hrData.leaveAllowance = Number(leaveAllowance);
    }

    const birthDate = dateOfBirth || dob;
    if (birthDate) hrData.dateOfBirth = parseDateDMY(birthDate);

    const { data: hr, error } = await supabase
      .from("Users")
      .insert(hrData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(hr);
  } catch (err) {
    console.error("Error creating HR:", err);
    res.status(500).json({
      message: "Failed to create HR",
      error: err.message,
    });
  }
};

export const updateHRAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    updates.updatedAt = new Date();

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    if (updates.dob !== undefined) {
      updates.dateOfBirth = updates.dob;
      delete updates.dob;
    }

    if (updates.dateOfBirth) {
      updates.dateOfBirth = parseDateDMY(updates.dateOfBirth);
    }

    if (updates.salary !== undefined) {
      updates.salary = updates.salary !== "" ? Number(updates.salary) : null;
    }

    if (updates.leaveAllowance !== undefined) {
      updates.leaveAllowance = updates.leaveAllowance !== "" ? Number(updates.leaveAllowance) : null;
    }

    // Clean up fields that don't belong to the database schema
    delete updates.department;

    const { data: hr, error } = await supabase
      .from("Users")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!hr) return res.status(404).json({ message: "HR not found" });

    res.json(hr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update HR" });
  }
};

export const deleteHRAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: hr, error } = await supabase
      .from("Users")
      .delete()
      .eq("id", id)
      .eq("role", "hr")
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!hr) return res.status(404).json({ message: "HR not found" });
    res.json({ message: "HR deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete HR" });
  }
};
