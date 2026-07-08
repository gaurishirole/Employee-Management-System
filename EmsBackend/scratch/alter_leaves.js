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
    console.log("Connected to DB, running alter table...");
    await client.query('ALTER TABLE "Leaves" ADD COLUMN IF NOT EXISTS "type" VARCHAR(255) DEFAULT \'Annual Leave\';');
    console.log("Alter table completed successfully!");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await client.end();
  }
}

run();
