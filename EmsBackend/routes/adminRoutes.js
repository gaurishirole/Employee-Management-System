import express from "express";
import { getAllUsersForEmails, sendLetterEmail } from "../controllers/hr/letterController.js";
import { createVacancy, getVacancies, updateVacancy, deleteVacancy } from "../controllers/vacancyController.js";
import {
  addCandidate,
  getCandidates,
  updateCandidate,
  sendCandidateEmail
} from "../controllers/hiringCandidateController.js";
import { uploadSingleFile, uploadToImageKit, uploadArray, handleMultipleUploads } from "../middleware/uploadMiddleware.js";
import {
  getAllEmployeesAdmin,
  createEmployeeAdmin,
  updateEmployeeAdmin,
  deleteEmployeeAdmin
} from "../controllers/admin/employeeController.js";
import {
  getAllLeadersAdmin,
  createLeaderAdmin,
  updateLeaderAdmin,
  deleteLeaderAdmin
} from "../controllers/admin/leaderController.js";
import {
  getAllAdminsAdmin,
  createAdminAdmin,
  updateAdminAdmin,
  deleteAdminAdmin
} from "../controllers/admin/adminController.js";
import {
  getAllHRsAdmin,
  createHRAdmin,
  updateHRAdmin,
  deleteHRAdmin
} from "../controllers/admin/hrController.js";
import { getAttendanceByDate } from "../controllers/admin/attendanceController.js";
import { getAttendance, checkIn, checkOut } from "../controllers/hr/attendanceController.js";
import {
  listHolidays,
  createHoliday,
  deleteHoliday
} from "../controllers/admin/holidayController.js";
import {
  getAllSalaries,
  creditSalary,
  calculateSalary,
  previewSalarySlip
} from "../controllers/admin/payrollController.js";
import {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam
} from "../controllers/admin/teamController.js";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/admin/projectController.js";
import {
  getAllLeaves,
  approveLeave,
  rejectLeave,
  updateUserLeaveAllowance,
  getUserLeaveInfo
} from "../controllers/admin/leaveController.js";
import {
  getEmployeesForVerification,
  verifyDocument,
  unverifyDocument
} from "../controllers/admin/verificationController.js";
import {
  getDelayedTasksAdmin,
  getAllTasksAdmin
} from "../controllers/admin/taskController.js";
import { searchEmployeesForAdmin } from "../controllers/admin/contactController.js";
import {
  getAttendanceReport,
  getTaskReport,
  getDelayReport,
  getUserReportData
} from "../controllers/admin/reportController.js";
import { getMyProfile, updateMyProfile, createOrUpdateProfile } from "../controllers/admin/profileController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectAdmin);

// Employee CRUD routes
router.get("/employees", getAllEmployeesAdmin);
router.post("/employees", createEmployeeAdmin);
router.put("/employees/:id", updateEmployeeAdmin);
router.delete("/employees/:id", deleteEmployeeAdmin);

// Leader CRUD routes
router.get("/leaders", getAllLeadersAdmin);
router.post("/leaders", createLeaderAdmin);
router.put("/leaders/:id", updateLeaderAdmin);
router.delete("/leaders/:id", deleteLeaderAdmin);

// Admin CRUD routes
router.get("/admins", getAllAdminsAdmin);
router.post("/admins", createAdminAdmin);
router.put("/admins/:id", updateAdminAdmin);
router.delete("/admins/:id", deleteAdminAdmin);

// HR CRUD routes
router.get("/hrs", getAllHRsAdmin);
router.post("/hrs", createHRAdmin);
router.put("/hrs/:id", updateHRAdmin);
router.delete("/hrs/:id", deleteHRAdmin);

// attendance management routes
router.get("/attendance/by-date", getAttendanceByDate);
router.get("/attendance", getAttendance);
router.post("/attendance/checkin", checkIn);
router.post("/attendance/checkout", checkOut);

// holiday management routes
router.get("/holidays", listHolidays);
router.post("/holidays", createHoliday);
router.delete("/holidays/:id", deleteHoliday);

// Salary routes
router.get("/salary", getAllSalaries);
router.post("/salary/calculate", calculateSalary);
router.post("/salary/credit", creditSalary);
router.get("/salary/slip/:id", previewSalarySlip);

// Team management routes
router.get("/teams", getAllTeams);
router.post("/teams", createTeam);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);

// Project management routes
router.get("/projects", getAllProjects);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

// leave management routes
router.get("/leave/all", getAllLeaves);
router.patch("/leave/:id/approve", approveLeave);
router.patch("/leave/:id/reject", rejectLeave);

// leave allowance management routes
router.put("/users/:id/leave-allowance", updateUserLeaveAllowance);
router.get("/users/:id/leave-info", getUserLeaveInfo);

// profile verification routes
router.get("/verification/employees", getEmployeesForVerification);
router.patch("/verification/:userId/document/:documentType", verifyDocument);
router.patch("/verification/:userId/document/:documentType/unverify", unverifyDocument);

// Admin profile routes
router.get("/profile", getMyProfile);
router.put("/profile", handleMultipleUploads, updateMyProfile);
router.post("/profile", createOrUpdateProfile);

// task delay notifications
router.get("/delayed-tasks", getDelayedTasksAdmin);

// all tasks (admin overview)
router.get("/all-tasks", getAllTasksAdmin);

// contact employee search
router.get("/contact", searchEmployeesForAdmin);

// report generation routes
router.get("/reports/attendance", getAttendanceReport);
router.get("/reports/tasks", getTaskReport);
router.get("/reports/delays", getDelayReport);
router.get("/reports/user-data", getUserReportData);

// Letters and Emails
router.get("/users", getAllUsersForEmails);
router.post("/send-letter", uploadSingleFile, sendLetterEmail);

// Hiring Pipeline
router.post("/hiring/candidates", uploadSingleFile, uploadToImageKit, addCandidate);
router.get("/hiring/candidates", getCandidates);
router.put("/hiring/candidates/:id", updateCandidate);
router.post("/hiring/candidates/:id/email", uploadArray, sendCandidateEmail);

// Vacancy routes merged
router.get("/vacancies", getVacancies);
router.post("/vacancies", createVacancy);
router.put("/vacancies/:id", updateVacancy);
router.delete("/vacancies/:id", deleteVacancy);

export default router;
