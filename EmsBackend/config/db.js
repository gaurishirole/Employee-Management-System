import { supabase } from "./supabase.js";
import pg from "pg";

const connectDB = async () => {
  try {
    if (process.env.DB_URI) {
      const client = new pg.Client({
        connectionString: process.env.DB_URI,
      });
      try {
        await client.connect();
        await client.query('ALTER TABLE "Leaves" ADD COLUMN IF NOT EXISTS "type" VARCHAR(255) DEFAULT \'Annual Leave\';');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log("Database schema migrated and cache reloaded successfully!");
      } catch (dbErr) {
        console.error("Migration error on startup:", dbErr.message);
      } finally {
        await client.end();
      }
    }

    // Attempt a simple query to verify connection to Supabase
    const { error } = await supabase.from("Users").select("id").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") { 
      // Ignore record not found (PGRST116) or relation not exist (42P01 - table not created yet)
      throw error;
    }
    console.log("Supabase Database connection verified successfully!");
  } catch (error) {
    console.error(`Error connecting to Supabase Database: ${error.message}`);
  }
};

export default connectDB;
