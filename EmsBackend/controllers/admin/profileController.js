import { supabase } from "../../config/supabase.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: user, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ message: "User not found" });
    
    // exclude password from response
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !user) return res.status(404).json({ message: "User not found" });

    const allowedFields = ["phone", "address", "dateOfBirth", "bankIFSC", "bankAccountNumber"];
    const currentDocuments = user.documents ? { ...user.documents } : {};
    const updatedFields = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field.startsWith("bank")) {
          currentDocuments[field] = req.body[field];
        } else {
          updatedFields[field] = req.body[field];
        }
      }
    });

    if (req.uploadedUrls) {
      Object.keys(req.uploadedUrls).forEach((key) => {
        currentDocuments[key] = {
          path: req.uploadedUrls[key],
          verified: false,
          uploadedAt: new Date().toISOString(),
        };
      });
    }

    updatedFields.documents = currentDocuments;

    const { error: updErr } = await supabase
      .from("Users")
      .update(updatedFields)
      .eq("id", userId);

    if (updErr) throw updErr;

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

    // Sync to Profiles table
    const profileFieldsToUpdate = {
      phone: updatedFields.phone !== undefined ? updatedFields.phone : user.phone,
      address: updatedFields.address !== undefined ? updatedFields.address : user.address,
      dateOfBirth: updatedFields.dateOfBirth !== undefined ? updatedFields.dateOfBirth : user.dateOfBirth,
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

    const { data: updatedUser, error: finalErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (finalErr || !updatedUser) throw finalErr || new Error("Failed to load updated user");

    delete updatedUser.password;
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
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

