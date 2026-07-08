import { supabase } from "../config/supabase.js";
import { sendMail } from "../utils/sendMail.js";

export const addCandidate = async (req, res) => {
  try {
    const { name, phone, email, source, role, notes, vacancyId } = req.body;
    let resumeUrl = req.imageUrl || "#";

    const { data: candidate, error } = await supabase
      .from("HiringCandidates")
      .insert({
        name,
        phone,
        email,
        source,
        role,
        vacancyId: vacancyId || null,
        resumeUrl,
        logs: [{ text: "Candidate Added by HR", timestamp: new Date().toISOString() }],
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(candidate);
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const { data: candidates, error } = await supabase
      .from("HiringCandidates")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { updates, logMsg } = req.body;

    const { data: candidate, error: findErr } = await supabase
      .from("HiringCandidates")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (findErr || !candidate) return res.status(404).json({ message: "Candidate not found" });

    const wasNotFinal = candidate.finalMailSent !== "Yes";
    
    let parsedUpdates = {};
    if (updates) {
      parsedUpdates = typeof updates === "string" ? JSON.parse(updates) : updates;
    }

    if (logMsg) {
      const currentLogs = Array.isArray(candidate.logs) ? [...candidate.logs] : [];
      currentLogs.push({ text: logMsg, timestamp: new Date().toISOString() });
      parsedUpdates.logs = currentLogs;
    }

    const mergedFinalMailSent = parsedUpdates.hasOwnProperty("finalMailSent") ? parsedUpdates.finalMailSent : candidate.finalMailSent;
    const mergedVacancyId = parsedUpdates.hasOwnProperty("vacancyId") ? parsedUpdates.vacancyId : candidate.vacancyId;

    if (wasNotFinal && mergedFinalMailSent === "Yes" && mergedVacancyId) {
      const { data: vacancy } = await supabase
        .from("Vacancies")
        .select("*")
        .eq("id", mergedVacancyId)
        .maybeSingle();

      if (vacancy) {
        const hiredCount = (vacancy.hiredEmployeesCount || 0) + 1;
        const status = hiredCount >= vacancy.numberOfEmployeesRequired ? "Closed" : vacancy.status;
        await supabase
          .from("Vacancies")
          .update({ hiredEmployeesCount: hiredCount, status })
          .eq("id", mergedVacancyId);
      }
    }

    const { data: updatedCandidate, error: updErr } = await supabase
      .from("HiringCandidates")
      .update(parsedUpdates)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;

    res.json(updatedCandidate);
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const sendCandidateEmail = async (req, res) => {
  try {
    const { subject, body, updates, logMsg } = req.body;
    const candidateId = req.params.id;

    const { data: candidate, error: findErr } = await supabase
      .from("HiringCandidates")
      .select("*")
      .eq("id", candidateId)
      .maybeSingle();

    if (findErr || !candidate) return res.status(404).json({ message: "Candidate not found" });

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
        });
      }
    }

    await sendMail(candidate.email, subject, "Please view this email in HTML", body, attachments);

    const wasNotFinal = candidate.finalMailSent !== "Yes";
    let parsedUpdates = {};

    if (updates && Object.keys(updates).length > 0) {
      parsedUpdates = typeof updates === "string" ? JSON.parse(updates) : updates;
    }

    if (logMsg) {
      const currentLogs = Array.isArray(candidate.logs) ? [...candidate.logs] : [];
      currentLogs.push({ text: logMsg, timestamp: new Date().toISOString() });
      parsedUpdates.logs = currentLogs;
    }

    const mergedFinalMailSent = parsedUpdates.hasOwnProperty("finalMailSent") ? parsedUpdates.finalMailSent : candidate.finalMailSent;
    const mergedVacancyId = parsedUpdates.hasOwnProperty("vacancyId") ? parsedUpdates.vacancyId : candidate.vacancyId;

    if (wasNotFinal && mergedFinalMailSent === "Yes" && mergedVacancyId) {
      const { data: vacancy } = await supabase
        .from("Vacancies")
        .select("*")
        .eq("id", mergedVacancyId)
        .maybeSingle();

      if (vacancy) {
        const hiredCount = (vacancy.hiredEmployeesCount || 0) + 1;
        const status = hiredCount >= vacancy.numberOfEmployeesRequired ? "Closed" : vacancy.status;
        await supabase
          .from("Vacancies")
          .update({ hiredEmployeesCount: hiredCount, status })
          .eq("id", mergedVacancyId);
      }
    }

    const { data: updatedCandidate, error: updErr } = await supabase
      .from("HiringCandidates")
      .update(parsedUpdates)
      .eq("id", candidateId)
      .select()
      .maybeSingle();

    if (updErr) throw updErr;

    res.json({ message: "Email sent and candidate updated successfully", candidate: updatedCandidate });
  } catch (error) {
    console.error("Error sending candidate email:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

