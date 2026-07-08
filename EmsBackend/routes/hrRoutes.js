import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { handleMultipleUploads, uploadSingleFile, uploadToImageKit, uploadArray } from "../middleware/uploadMiddleware.js";
import { getDashboard } from "../controllers/hr/dashboardController.js";
import { getMyProfile, updateMyProfile, createOrUpdateProfile } from "../controllers/hr/profileController.js";
import {
  checkIn,
  checkOut,
  getAttendance,
  getAllAttendance
} from "../controllers/hr/attendanceController.js";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} from "../controllers/hr/leaveController.js";
import { getAllUsersForEmails, sendLetterEmail } from "../controllers/hr/letterController.js";
import { searchEmployeesForHR } from "../controllers/hr/contactController.js";
import {
  getAllSalaries,
  calculateSalary,
  creditSalary,
  previewSalarySlip
} from "../controllers/admin/payrollController.js";
import { getAllEmployeesAdmin } from "../controllers/admin/employeeController.js";
import { getAllLeadersAdmin } from "../controllers/admin/leaderController.js";
import { getAllHRsAdmin } from "../controllers/admin/hrController.js";
import {
  getEmployeesForVerification,
  verifyDocument,
  unverifyDocument
} from "../controllers/admin/verificationController.js";
import {
  addCandidate,
  getCandidates,
  updateCandidate,
  sendCandidateEmail
} from "../controllers/hiringCandidateController.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("hr"));

// Dashboard
router.get("/dashboard", getDashboard);

// Profile
router.get("/profile", getMyProfile);
router.put("/profile", handleMultipleUploads, updateMyProfile);
router.post("/profile", createOrUpdateProfile);

// Self Attendance
router.post("/attendance/checkin", checkIn);
router.post("/attendance/checkout", checkOut);
router.get("/attendance", getAttendance);

// Self Leave
router.post("/leave/apply", applyLeave);
router.get("/leave/my", getMyLeaves);

// Management
router.get("/manage/attendance", getAllAttendance);
router.get("/manage/leaves", getAllLeaves);
router.put("/manage/leave/:id/status", updateLeaveStatus);

// Profile Verification
router.get("/verification/employees", getEmployeesForVerification);
router.patch("/verification/:userId/document/:documentType", verifyDocument);
router.patch("/verification/:userId/document/:documentType/unverify", unverifyDocument);

// Letters and Emails
router.get("/users", getAllUsersForEmails);
router.post("/send-letter", uploadSingleFile, sendLetterEmail);

// Salary Management
router.get("/salary", getAllSalaries);
router.post("/salary/calculate", calculateSalary);
router.post("/salary/credit", creditSalary);
router.get("/salary/slip/:id", previewSalarySlip);

// Users (for dropdowns)
router.get("/employees", getAllEmployeesAdmin);
router.get("/leaders", getAllLeadersAdmin);
router.get("/hrs", getAllHRsAdmin);

// Hiring Pipeline
router.post("/hiring/candidates", uploadSingleFile, uploadToImageKit, addCandidate);
router.get("/hiring/candidates", getCandidates);
router.put("/hiring/candidates/:id", updateCandidate);
router.post("/hiring/candidates/:id/email", uploadArray, sendCandidateEmail);

// Contact Employee Search
router.get("/contact", searchEmployeesForHR);

export default router;
