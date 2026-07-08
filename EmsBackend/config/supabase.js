import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl && process.env.DB_URI) {
  // Try parsing from DB_URI: postgresql://...db.xxx.supabase.co:5432/postgres
  const match = process.env.DB_URI.match(/db\.([a-z0-9]+)\.supabase\.co/i);
  if (match && match[1]) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  }
}

// Fallback just in case
if (!supabaseUrl) {
  supabaseUrl = "https://igrageuodjfmtjcbzfsk.supabase.co";
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error("WARNING: Supabase keys are missing in environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
