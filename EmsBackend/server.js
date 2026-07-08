import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import { startCelebrationJob } from "./utils/celebrationJob.js";

// Initialize SQL database connection and sync models
connectDB();

const app = express();
const configuredOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/$/, "");
  if (configuredOrigins.includes(normalizedOrigin)) return true;
  try {
    const parsedOrigin = new URL(normalizedOrigin);
    if (parsedOrigin.hostname === "localhost") return true;
  } catch (err) {
    return false;
  }
  return false;
};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/leader", managerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/hr", hrRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available globally for emitting notifications
global.io = io;

// Error middleware
app.use(errorHandler);

// Start celebration cron job
startCelebrationJob();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
