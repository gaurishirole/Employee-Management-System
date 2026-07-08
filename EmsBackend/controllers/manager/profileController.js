import { supabase } from "../../config/supabase.js";
import { sendMail } from "../../utils/sendMail.js";

export const getMyLeaderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: user, error } = await supabase
      .from("Users")
      .select(`
        *,
        reportingManager:Users!reportingManagerId(id, name, email),
        technicalReporting:Users!technicalReportingId(id, name, email),
        administrativeReporting:Users!administrativeReportingId(id, name, email)
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ message: "User not found" });

    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    console.error("getMyLeaderProfile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMyLeaderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: existingUser, error: findErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !existingUser) return res.status(404).json({ message: "User not found" });

    const allowedFields = ["phone", "address"];
    const currentDocuments = existingUser.documents ? { ...existingUser.documents } : {};
    const updatedFields = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedFields[field] = req.body[field];
      }
    });

    if (req.body.isMarried !== undefined) {
      const isMarriedBool = String(req.body.isMarried).toLowerCase() === "true";
      updatedFields.isMarried = isMarriedBool;
      if (!isMarriedBool) {
        updatedFields.marriageAnniversary = null;
      }
    }
    if (req.body.marriageAnniversary !== undefined) {
      const raw = req.body.marriageAnniversary;
      if (raw === "" || raw === null) {
        updatedFields.marriageAnniversary = null;
      } else {
        const ann = new Date(raw);
        if (isNaN(ann)) {
          return res.status(400).json({ message: "Invalid marriageAnniversary date" });
        }
        updatedFields.marriageAnniversary = ann.toISOString();
        updatedFields.isMarried = true;
      }
    }

    if (req.body.bankIFSC) currentDocuments.bankIFSC = req.body.bankIFSC;
    if (req.body.bankAccountNumber)
      currentDocuments.bankAccountNumber = req.body.bankAccountNumber;

    if (req.uploadedUrls) {
      const verifiedDocuments = [];
      for (const key of Object.keys(req.uploadedUrls)) {
        if (existingUser.documents && existingUser.documents[key] && existingUser.documents[key].verified) {
          verifiedDocuments.push(key);
        }
      }

      if (verifiedDocuments.length > 0) {
        return res.status(403).json({
          message: `Cannot update verified document(s): ${verifiedDocuments.join(", ")}. Please contact admin to unverify the document(s) before updating.`,
          verifiedDocuments,
        });
      }

      Object.keys(req.uploadedUrls).forEach((key) => {
        currentDocuments[key] = {
          path: req.uploadedUrls[key],
          verified: false,
          uploadedAt: new Date().toISOString(),
        };
      });
    }

    updatedFields.documents = currentDocuments;

    // Check profile verification
    const docFields = [
      "passportPhoto",
      "tenthMarksheet",
      "twelthDiplomaMarksheet",
      "graduationMarksheet",
      "bankPassbookPhoto",
      "aadharFront",
      "aadharBack",
      "panCard",
      "cv",
    ];
    const allVerified = docFields.every(
      (field) =>
        !currentDocuments ||
        !currentDocuments[field] ||
        !currentDocuments[field].path ||
        currentDocuments[field].verified
    );
    updatedFields.profileVerified = allVerified;

    const { error: updErr } = await supabase
      .from("Users")
      .update(updatedFields)
      .eq("id", userId);

    if (updErr) throw updErr;

    // Sync to Profiles table
    const profileFieldsToUpdate = {
      phone: updatedFields.phone !== undefined ? updatedFields.phone : existingUser.phone,
      address: updatedFields.address !== undefined ? updatedFields.address : existingUser.address,
      dateOfBirth: updatedFields.dateOfBirth !== undefined ? updatedFields.dateOfBirth : existingUser.dateOfBirth,
      isMarried: updatedFields.isMarried !== undefined ? updatedFields.isMarried : existingUser.isMarried,
      marriageAnniversary: updatedFields.marriageAnniversary !== undefined ? updatedFields.marriageAnniversary : existingUser.marriageAnniversary,
      bankIFSC: currentDocuments.bankIFSC || null,
      bankAccountNumber: currentDocuments.bankAccountNumber || null,
      profileVerified: allVerified,
      updatedAt: new Date().toISOString()
    };

    docFields.forEach((field) => {
      if (currentDocuments[field] && currentDocuments[field].path) {
        profileFieldsToUpdate[field] = currentDocuments[field].path;
      }
    });

    const { data: existingProf, error: profErr } = await supabase
      .from("Profiles")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (!profErr) {
      if (existingProf) {
        await supabase
          .from("Profiles")
          .update(profileFieldsToUpdate)
          .eq("userId", userId);
      } else {
        await supabase
          .from("Profiles")
          .insert([{ userId, ...profileFieldsToUpdate }]);
      }
    }

    if (req.uploadedUrls && Object.keys(req.uploadedUrls).length > 0) {
      const { data: admins } = await supabase
        .from("Users")
        .select("email")
        .eq("role", "admin");

      const updatedDocs = Object.keys(req.uploadedUrls).join(", ");
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Profile Documents Updated</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6fa; color:#333;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fa; padding:20px 0;">
            <tr>
              <td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA6F0, #A756FA); text-align:center; padding:30px 20px; border-top-left-radius:12px; border-top-right-radius:12px;">
                      <h1 style="margin:0; color:#fff; font-size:24px;">The DataTech Labs Pvt. Ltd.</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 25px; text-align:center;">
                      <p style="font-size:16px; color:#555; margin-bottom:20px;">
                        Profile documents have been updated by <strong>${existingUser.name}</strong> (${existingUser.email}).
                      </p>
                      <div style="background-color:#f9f9f9; padding:20px; border-radius:8px; margin:20px 0; text-align:left;">
                        <h3 style="margin:0 0 15px 0; color:#0EA6F0; font-size:18px;">Updated Documents:</h3>
                        <p style="margin:5px 0; font-size:14px;">${updatedDocs}</p>
                      </div>
                      <p style="font-size:14px; color:#777; margin-top:20px;">
                        Please review and verify the documents in the admin panel.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f0f3f8; text-align:center; padding:20px 15px;">
                      <p style="margin:0; font-size:12px; color:#999;">
                        &copy; 2025 The DataTech Labs Pvt. Ltd. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      (admins || []).forEach(async (admin) => {
        await sendMail(admin.email, "Profile Documents Updated", "", htmlContent);
      });
    }

    const { data: updatedUser, error: finalErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (finalErr) throw finalErr;

    delete updatedUser.password;
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("updateMyLeaderProfile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const phone = req.body.phone;
    const address = req.body.address || req.body.location;
    const dateOfBirth = req.body.dateOfBirth;
    let isMarried = req.body.isMarried;
    if (isMarried === undefined && req.body.maritalStatus !== undefined) {
      isMarried = String(req.body.maritalStatus).toLowerCase() === 'married' || req.body.maritalStatus === true;
    }
    const marriageAnniversary = req.body.marriageAnniversary;
    const bankIFSC = req.body.bankIFSC || req.body.bankIfsc;
    const bankAccountNumber = req.body.bankAccountNumber || req.body.bankAccount;

    // Get current documents from Users table
    const { data: user, error: userErr } = await supabase
      .from("Users")
      .select("documents")
      .eq("id", userId)
      .maybeSingle();

    if (userErr) throw userErr;
    const currentDocuments = user?.documents || {};

    // Keep Users table in sync
    const usersFieldsToUpdate = {
      phone,
      address,
      dateOfBirth,
      isMarried,
      marriageAnniversary
    };
    
    // Remove undefined values
    Object.keys(usersFieldsToUpdate).forEach(key => {
      if (usersFieldsToUpdate[key] === undefined) {
        delete usersFieldsToUpdate[key];
      }
    });

    if (bankIFSC !== undefined) currentDocuments.bankIFSC = bankIFSC;
    if (bankAccountNumber !== undefined) currentDocuments.bankAccountNumber = bankAccountNumber;
    usersFieldsToUpdate.documents = currentDocuments;

    const { error: usersUpdateErr } = await supabase
      .from("Users")
      .update(usersFieldsToUpdate)
      .eq("id", userId);
    if (usersUpdateErr) throw usersUpdateErr;

    const { data: existingProfile, error: findErr } = await supabase
      .from("Profiles")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (findErr) throw findErr;

    const dataToSave = {
      userId,
      phone: phone !== undefined ? phone : existingProfile?.phone,
      address: address !== undefined ? address : existingProfile?.address,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : existingProfile?.dateOfBirth,
      isMarried: isMarried !== undefined ? isMarried : existingProfile?.isMarried,
      marriageAnniversary: marriageAnniversary !== undefined ? marriageAnniversary : existingProfile?.marriageAnniversary,
      bankIFSC: bankIFSC !== undefined ? bankIFSC : existingProfile?.bankIFSC,
      bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : existingProfile?.bankAccountNumber,
      updatedAt: new Date().toISOString()
    };

    // Map documents to individual columns in Profiles
    const docFields = [
      "passportPhoto",
      "tenthMarksheet",
      "twelthDiplomaMarksheet",
      "graduationMarksheet",
      "bankPassbookPhoto",
      "aadharFront",
      "aadharBack",
      "panCard",
      "cv",
    ];
    docFields.forEach(field => {
      if (currentDocuments[field] && currentDocuments[field].path) {
        dataToSave[field] = currentDocuments[field].path;
      } else if (existingProfile && existingProfile[field]) {
        dataToSave[field] = existingProfile[field];
      }
    });

    if (existingProfile) {
      const { data, error } = await supabase
        .from("Profiles")
        .update(dataToSave)
        .eq("userId", userId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ message: "Profile saved successfully", profile: data });
    } else {
      const { data, error } = await supabase
        .from("Profiles")
        .insert([dataToSave])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ message: "Profile saved successfully", profile: data });
    }
  } catch (error) {
    console.error("createOrUpdateProfile error:", error);
    res.status(500).json({ message: "Failed to store profile details", error: error.message });
  }
};

