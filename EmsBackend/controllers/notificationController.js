import { supabase } from "../config/supabase.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRole = req.user.role;
    const { data: notifications, error } = await supabase
      .from("Notifications")
      .select("*")
      .or(`recipientId.eq.${userId},and(role.eq.${userRole},recipientId.is.null)`)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: notification, error } = await supabase
      .from("Notifications")
      .update({ readStatus: true })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};

export const createNotification = async ({ message, role, triggeredBy, recipient }) => {
  try {
    const { data: notification, error } = await supabase
      .from("Notifications")
      .insert({
        message,
        role,
        triggeredById: triggeredBy,
        recipientId: recipient || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (global.io) {
      if (recipient) {
        global.io.emit("notification", {
          notification,
          recipient: String(recipient)
        });
      } else if (role) {
        global.io.emit("notification", {
          notification,
          role
        });
      }
    }
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

