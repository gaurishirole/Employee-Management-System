import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase.js";
import { parseDateDMY } from "../helpers.js";

export const getAllAdminsAdmin = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from("Users")
      .select("*")
      .eq("role", "admin");

    if (error) throw error;
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

export const createAdminAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address, position, salary, dob, dateOfBirth, leaveAllowance } = req.body;
    const { data: existing } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      position: position || null,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (salary !== undefined && salary !== "") {
      adminData.salary = Number(salary);
    }
    if (leaveAllowance !== undefined && leaveAllowance !== "") {
      adminData.leaveAllowance = Number(leaveAllowance);
    }

    const birthDate = dateOfBirth || dob;
    if (birthDate) adminData.dateOfBirth = parseDateDMY(birthDate);

    const { data: admin, error } = await supabase
      .from("Users")
      .insert(adminData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(admin);
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({
      message: "Failed to create admin",
      error: err.message,
    });
  }
};

export const updateAdminAdmin = async (req, res) => {
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

    const { data: admin, error } = await supabase
      .from("Users")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update admin" });
  }
};

export const deleteAdminAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: admin, error } = await supabase
      .from("Users")
      .delete()
      .eq("id", id)
      .eq("role", "admin")
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};
