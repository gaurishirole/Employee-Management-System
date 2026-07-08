import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

const getTokenFromRequest = (req) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (token) return token;
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
};

export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from("Users")
      .select(`
        *,
        reportingManager:Users!reportingManagerId(id, name, email, position),
        technicalReporting:Users!technicalReportingId(id, name, email, position),
        administrativeReporting:Users!administrativeReportingId(id, name, email, position)
      `)
      .eq("id", decoded.id)
      .maybeSingle();

    if (error || !user) return res.status(401).json({ message: "User not found" });

    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token failed" });
  }
};

export const protectEmployee = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Require employee role" });
    }
    next();
  });
};

export const protectLeader = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from("Users")
      .select(`
        *,
        reportingManager:Users!reportingManagerId(id, name, email, position),
        technicalReporting:Users!technicalReportingId(id, name, email, position),
        administrativeReporting:Users!administrativeReportingId(id, name, email, position)
      `)
      .eq("id", decoded.id)
      .maybeSingle();

    if (error || !user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "leader" && user.role !== "manager" && user.role !== "leaders" && user.role !== "admin") {
      return res.status(403).json({ message: "Require leader/manager/admin role" });
    }

    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    console.error("protectLeader error:", err);
    return res.status(401).json({ message: "Token failed" });
  }
};

export const protectAdmin = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Require admin role" });
    next();
  });
};
