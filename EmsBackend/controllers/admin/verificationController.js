import { supabase } from "../../config/supabase.js";
import { createNotification } from "../notificationController.js";
import { sendMail } from "../../utils/sendMail.js";

export const getEmployeesForVerification = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("Users")
      .select("*")
      .in("role", ["employee", "leader"]);

    if (error) throw error;

    const usersWithDocs = (users || []).map((user) => {
      const documentFields = [
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

      const documents = {};
      documentFields.forEach((field) => {
        if (user.documents && user.documents[field] && user.documents[field].path) {
          documents[field] = {
            path: user.documents[field].path,
            verified: user.documents[field].verified || false,
            uploadedAt: user.documents[field].uploadedAt,
          };
        }
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileVerified: user.profileVerified,
        documents,
        hasDocuments: Object.keys(documents).length > 0,
        hasPendingDocuments: Object.values(documents).some((doc) => !doc.verified),
      };
    });

    const filteredUsers = usersWithDocs.filter((user) => user.hasDocuments);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching employees for verification:", error);
    res.status(500).json({ message: "Failed to fetch employees for verification" });
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.params;
    const { verified } = req.body;

    if (!userId || !documentType) {
      return res.status(400).json({ message: "userId and documentType are required" });
    }

    if (verified === undefined) {
      return res.status(400).json({ message: "verified status is required" });
    }

    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !user) return res.status(404).json({ message: "User not found" });

    const currentDocuments = user.documents ? { ...user.documents } : {};

    if (!currentDocuments[documentType]) {
      return res.status(400).json({ message: "Document type not found" });
    }

    if (!currentDocuments[documentType].path) {
      return res.status(400).json({ message: "No document uploaded for this type" });
    }

    currentDocuments[documentType].verified = verified;

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
        !currentDocuments || !currentDocuments[field] || !currentDocuments[field].path || currentDocuments[field].verified
    );

    const { error: updErr } = await supabase
      .from("Users")
      .update({ documents: currentDocuments, profileVerified: allVerified })
      .eq("id", userId);

    if (updErr) throw updErr;

    // Sync verification status to Profiles table
    await supabase
      .from("Profiles")
      .update({ profileVerified: allVerified })
      .eq("userId", userId);

    const { data: updatedUser } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const cleanDocs = updatedUser.documents ? { ...updatedUser.documents } : {};
    const documents = {};
    docFields.forEach((field) => {
      if (cleanDocs[field] && cleanDocs[field].path) {
        documents[field] = {
          path: cleanDocs[field].path,
          verified: cleanDocs[field].verified || false,
          uploadedAt: cleanDocs[field].uploadedAt,
        };
      }
    });

    const statusMsg = verified ? "verified" : "unverified";

    await createNotification({
      message: `Your document "${documentType}" has been ${statusMsg} by admin.`,
      role: user.role,
      recipient: userId,
      triggeredBy: req.user.id,
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Document ${verified ? "Verified" : "Unverified"}</title>
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
                      Your document has been <strong>${statusMsg}</strong> by the admin.
                    </p>
                    <div style="background-color:#f9f9f9; padding:20px; border-radius:8px; margin:20px 0; text-align:left;">
                      <h3 style="margin:0 0 15px 0; color:#0EA6F0; font-size:18px;">Document Details:</h3>
                      <p style="margin:5px 0; font-size:14px;"><strong>Type:</strong> ${documentType}</p>
                      <p style="margin:5px 0; font-size:14px;"><strong>Status:</strong> ${statusMsg.charAt(0).toUpperCase() + statusMsg.slice(1)
      }</p>
                    </div>
                    ${!verified
        ? '<p style="font-size:14px; color:#d9534f; margin-top:20px;"><strong>Note:</strong> You can now update this document. Please re-upload if needed.</p>'
        : ""
      }
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

    await sendMail(user.email, `Document ${verified ? "Verified" : "Unverified"}`, "", htmlContent);

    res.status(200).json({
      message: `Document ${statusMsg} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileVerified: updatedUser.profileVerified,
        documents,
      },
    });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ message: "Failed to verify document" });
  }
};

export const unverifyDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.params;

    if (!userId || !documentType) {
      return res.status(400).json({ message: "userId and documentType are required" });
    }

    const { data: user, error: findErr } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (findErr || !user) return res.status(404).json({ message: "User not found" });

    const currentDocuments = user.documents ? { ...user.documents } : {};

    if (!currentDocuments[documentType]) {
      return res.status(400).json({ message: "Document type not found" });
    }

    if (!currentDocuments[documentType].path) {
      return res.status(400).json({ message: "No document uploaded for this type" });
    }

    if (!currentDocuments[documentType].verified) {
      return res.status(400).json({ message: "Document is already unverified" });
    }

    currentDocuments[documentType].verified = false;

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
        !currentDocuments || !currentDocuments[field] || !currentDocuments[field].path || currentDocuments[field].verified
    );

    const { error: updErr } = await supabase
      .from("Users")
      .update({ documents: currentDocuments, profileVerified: allVerified })
      .eq("id", userId);

    if (updErr) throw updErr;

    // Sync verification status to Profiles table
    await supabase
      .from("Profiles")
      .update({ profileVerified: allVerified })
      .eq("userId", userId);

    const { data: updatedUser } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const cleanDocs = updatedUser.documents ? { ...updatedUser.documents } : {};
    const documents = {};
    docFields.forEach((field) => {
      if (cleanDocs[field] && cleanDocs[field].path) {
        documents[field] = {
          path: cleanDocs[field].path,
          verified: cleanDocs[field].verified || false,
          uploadedAt: cleanDocs[field].uploadedAt,
        };
      }
    });

    await createNotification({
      message: `Your document "${documentType}" has been unverified by admin. You can now update it.`,
      role: user.role,
      recipient: userId,
      triggeredBy: req.user.id,
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Document Unverified</title>
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
                      Your document has been <strong>unverified</strong> by the admin.
                    </p>
                    <div style="background-color:#f9f9f9; padding:20px; border-radius:8px; margin:20px 0; text-align:left;">
                      <h3 style="margin:0 0 15px 0; color:#0EA6F0; font-size:18px;">Document Details:</h3>
                      <p style="margin:5px 0; font-size:14px;"><strong>Type:</strong> ${documentType}</p>
                      <p style="margin:5px 0; font-size:14px;"><strong>Status:</strong> Unverified</p>
                    </div>
                    <p style="font-size:14px; color:#d9534f; margin-top:20px;"><strong>Note:</strong> You can now update this document. Please re-upload if needed.</p>
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

    await sendMail(user.email, "Document Unverified - You Can Now Update", "", htmlContent);

    res.status(200).json({
      message: "Document unverified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileVerified: updatedUser.profileVerified,
        documents,
      },
    });
  } catch (error) {
    console.error("Error unverifying document:", error);
    res.status(500).json({ message: "Failed to unverify document" });
  }
};
