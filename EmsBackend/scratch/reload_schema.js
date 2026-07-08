import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DB_URI,
  });
  try {
    await client.connect();
    console.log("Connected to DB, reloading schema cache...");
    
    // First, let's also make sure the column is added in case it wasn't added successfully due to some reason
    await client.query('ALTER TABLE "Leaves" ADD COLUMN IF NOT EXISTS "type" VARCHAR(255) DEFAULT \'Annual Leave\';');
    console.log("Verified 'type' column exists.");

    // Now reload the schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Sent reload schema notification successfully!");
  } catch (error) {
    console.error("Error during reload:", error);
  } finally {
    await client.end();
  }
}

run();
