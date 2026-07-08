import express from "express";
import { getDashboard } from "../controllers/employee/dashboardController.js";
import { getMyProfile, updateMyProfile, createOrUpdateProfile } from "../controllers/employee/profileController.js";
import {
  checkIn,
  checkOut,
  getAttendance
} from "../controllers/employee/attendanceController.js";
import { getMyTeams } from "../controllers/employee/teamController.js";
import { getProjectsForEmployee } from "../controllers/employee/projectController.js";
import { getMyTasks, updateTaskStatus } from "../controllers/employee/taskController.js";
import {
  applyLeave,
  getMyLeaves,
  updateMyLeave
} from "../controllers/employee/leaveController.js";
import { searchEmployeesForEmployee } from "../controllers/employee/contactController.js";
import { getTodayCelebrations } from "../controllers/employee/celebrationController.js";
import { getHolidaysForEmployee } from "../controllers/employee/holidayController.js";
import { protectEmployee } from "../middleware/authMiddleware.js";
import { handleMultipleUploads } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/dashboard", protectEmployee, getDashboard);

router.post("/attendance/checkin", protectEmployee, checkIn);
router.post("/attendance/checkout", protectEmployee, checkOut);
router.get("/attendance", protectEmployee, getAttendance);

router.get("/holidays", protectEmployee, getHolidaysForEmployee);

router.get("/teams", protectEmployee, getMyTeams);

router.get("/projects", protectEmployee, getProjectsForEmployee);

router.get("/tasks", protectEmployee, getMyTasks);
router.patch("/tasks/:taskId/status", protectEmployee, updateTaskStatus);

router.post("/leave/apply", protectEmployee, applyLeave);
router.get("/leave/my", protectEmployee, getMyLeaves);
router.patch("/leave/:id", protectEmployee, updateMyLeave);

router.get("/profile", protectEmployee, getMyProfile);
router.put("/profile", protectEmployee, handleMultipleUploads, updateMyProfile);
router.post("/profile", protectEmployee, createOrUpdateProfile);

router.get("/contact", protectEmployee, searchEmployeesForEmployee);

router.get("/celebrations/today", protectEmployee, getTodayCelebrations);

export default router;
