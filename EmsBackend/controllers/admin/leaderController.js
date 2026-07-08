import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase.js";
import { parseDateDMY, isValidId } from "../helpers.js";

export const getAllLeadersAdmin = async (req, res) => {
  try {
    const { data: leaders, error } = await supabase
      .from("Users")
      .select("*")
      .eq("role", "leader");

    if (error) throw error;
    res.json(leaders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaders" });
  }
};

export const createLeaderAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      position,
      salary,
      dateOfBirth,
      dob,
      leaveAllowance,
      reportingManager,
      technicalReporting,
      administrativeReporting,
    } = req.body;

    const { data: existing } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const leaderData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      position: position || null,
      role: "leader",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (salary !== undefined && salary !== "") {
      leaderData.salary = Number(salary);
    }
    if (leaveAllowance !== undefined && leaveAllowance !== "") {
      leaderData.leaveAllowance = Number(leaveAllowance);
    }

    const birthDate = dateOfBirth || dob;
    if (birthDate) leaderData.dateOfBirth = parseDateDMY(birthDate);

    if (isValidId(reportingManager)) leaderData.reportingManagerId = Number(reportingManager);
    if (isValidId(technicalReporting)) leaderData.technicalReportingId = Number(technicalReporting);
    if (isValidId(administrativeReporting)) leaderData.administrativeReportingId = Number(administrativeReporting);

    const { data: leader, error } = await supabase
      .from("Users")
      .insert(leaderData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(leader);
  } catch (err) {
    console.error("Error creating leader:", err);
    res.status(500).json({
      message: "Failed to create leader",
      error: err.message,
    });
  }
};

export const updateLeaderAdmin = async (req, res) => {
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

    if (updates.reportingManager !== undefined) {
      updates.reportingManagerId = isValidId(updates.reportingManager) ? Number(updates.reportingManager) : null;
      delete updates.reportingManager;
    }
    if (updates.technicalReporting !== undefined) {
      updates.technicalReportingId = isValidId(updates.technicalReporting) ? Number(updates.technicalReporting) : null;
      delete updates.technicalReporting;
    }
    if (updates.administrativeReporting !== undefined) {
      updates.administrativeReportingId = isValidId(updates.administrativeReporting) ? Number(updates.administrativeReporting) : null;
      delete updates.administrativeReporting;
    }

    // Clean up fields that don't belong to the database schema
    delete updates.department;

    const { data: leader, error } = await supabase
      .from("Users")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!leader) return res.status(404).json({ message: "Leader not found" });

    res.json(leader);
  } catch (err) {
    console.error("Error updating leader:", err);
    res.status(500).json({
      message: "Failed to update leader",
      error: err.message,
    });
  }
};

export const deleteLeaderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: leader, error } = await supabase
      .from("Users")
      .delete()
      .eq("id", id)
      .eq("role", "leader")
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!leader) return res.status(404).json({ message: "Leader not found" });

    res.json({ message: "Leader deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete leader" });
  }
};
