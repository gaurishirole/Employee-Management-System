import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DB_URI,
});

async function main() {
  await client.connect();
  try {
    console.log("Creating Profiles table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Profiles" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL UNIQUE REFERENCES "Users"("id") ON DELETE CASCADE,
          "phone" VARCHAR(255),
          "address" TEXT,
          "dateOfBirth" TIMESTAMP WITH TIME ZONE,
          "isMarried" BOOLEAN DEFAULT FALSE,
          "marriageAnniversary" TIMESTAMP WITH TIME ZONE,
          "bankIFSC" VARCHAR(255),
          "bankAccountNumber" VARCHAR(255),
          "passportPhoto" VARCHAR(500),
          "tenthMarksheet" VARCHAR(500),
          "twelthDiplomaMarksheet" VARCHAR(500),
          "graduationMarksheet" VARCHAR(500),
          "bankPassbookPhoto" VARCHAR(500),
          "aadharFront" VARCHAR(500),
          "aadharBack" VARCHAR(500),
          "panCard" VARCHAR(500),
          "cv" VARCHAR(500),
          "profileVerified" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Profiles table created successfully!");
  } catch (err) {
    console.error("Error creating Profiles table:", err);
  } finally {
    await client.end();
  }
}

main();
