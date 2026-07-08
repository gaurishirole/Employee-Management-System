import express from "express";
import { getLeaderDashboardSummary } from "../controllers/manager/dashboardController.js";
import { getMyLeaderProfile, updateMyLeaderProfile, createOrUpdateProfile } from "../controllers/manager/profileController.js";
import { getLeaderTeams, getTeamMembersByProject } from "../controllers/manager/teamController.js";
import { getLeaderProjects } from "../controllers/manager/projectController.js";
import { createProject } from "../controllers/admin/projectController.js";
import {
  leaderCheckIn,
  leaderCheckOut,
  getLeaderAttendance,
  getTeamAttendance
} from "../controllers/manager/attendanceController.js";
import { assignTask, getTasksAssignedByLeader } from "../controllers/manager/taskController.js";
import {
  applyLeaderLeave,
  getMyLeaderLeaves,
  updateMyLeaderLeave
} from "../controllers/manager/leaveController.js";
import { searchEmployeesForLeader } from "../controllers/manager/contactController.js";
import { getTodayCelebrations } from "../controllers/manager/celebrationController.js";
import { getHolidaysForLeader } from "../controllers/manager/holidayController.js";
import { protectLeader } from "../middleware/authMiddleware.js";
import { handleMultipleUploads } from "../middleware/uploadMiddleware.js";
import { createVacancy, getVacancies, updateVacancy, deleteVacancy } from "../controllers/vacancyController.js";

const router = express.Router();

router.get("/teams", protectLeader, getLeaderTeams);
router.get("/projects", protectLeader, getLeaderProjects);
router.post("/projects", protectLeader, createProject);

router.post("/attendance/checkin", protectLeader, leaderCheckIn);
router.post("/attendance/checkout", protectLeader, leaderCheckOut);
router.get("/attendance", protectLeader, getLeaderAttendance);

router.post("/assign-task", protectLeader, assignTask);
router.get("/my-assigned-tasks", protectLeader, getTasksAssignedByLeader);
router.get("/team-members", protectLeader, getTeamMembersByProject);

router.post("/leave/apply", protectLeader, applyLeaderLeave);
router.get("/leave/my", protectLeader, getMyLeaderLeaves);
router.patch("/leave/:id", protectLeader, updateMyLeaderLeave);

router.get("/dashboard", protectLeader, getLeaderDashboardSummary);
router.get("/team-attendance", protectLeader, getTeamAttendance);

router.get("/profile", protectLeader, getMyLeaderProfile);
router.put("/profile", protectLeader, handleMultipleUploads, updateMyLeaderProfile);
router.post("/profile", protectLeader, createOrUpdateProfile);

router.get("/contact", protectLeader, searchEmployeesForLeader);
router.get("/celebrations/today", protectLeader, getTodayCelebrations);
router.get("/holidays", protectLeader, getHolidaysForLeader);

// Vacancy routes merged
router.get("/vacancies", protectLeader, getVacancies);
router.post("/vacancies", protectLeader, createVacancy);
router.put("/vacancies/:id", protectLeader, updateVacancy);
router.delete("/vacancies/:id", protectLeader, deleteVacancy);

export default router;
