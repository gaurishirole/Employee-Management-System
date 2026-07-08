-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Migrate existing 'users' table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Users') THEN
        ALTER TABLE users RENAME TO "Users";
    END IF;
END $$;

-- 2. Rename columns to camelCase if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Users' AND column_name = 'created_at') THEN
        ALTER TABLE "Users" RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Users' AND column_name = 'otp_expiry') THEN
        ALTER TABLE "Users" RENAME COLUMN otp_expiry TO "otpExpiry";
    END IF;
END $$;

-- Drop other tables if they exist (in reverse order of dependencies) - we do not drop "Users"
DROP TABLE IF EXISTS "TeamMembers" CASCADE;
DROP TABLE IF EXISTS "TeamProjects" CASCADE;
DROP TABLE IF EXISTS "Teams" CASCADE;
DROP TABLE IF EXISTS "Tasks" CASCADE;
DROP TABLE IF EXISTS "Salaries" CASCADE;
DROP TABLE IF EXISTS "ResetTokens" CASCADE;
DROP TABLE IF EXISTS "Notifications" CASCADE;
DROP TABLE IF EXISTS "Leaves" CASCADE;
DROP TABLE IF EXISTS "Holidays" CASCADE;
DROP TABLE IF EXISTS "HiringCandidates" CASCADE;
DROP TABLE IF EXISTS "Vacancies" CASCADE;
DROP TABLE IF EXISTS "Attendances" CASCADE;
DROP TABLE IF EXISTS "Projects" CASCADE;

-- 3. Create or update Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "address" TEXT,
    "position" VARCHAR(255),
    "salary" DOUBLE PRECISION,
    "role" VARCHAR(50) DEFAULT 'employee' CHECK ("role" IN ('admin', 'hr', 'leader', 'employee')),
    "dateOfJoining" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMP WITH TIME ZONE,
    "reportingManagerId" INTEGER,
    "technicalReportingId" INTEGER,
    "administrativeReportingId" INTEGER,
    "isActive" BOOLEAN DEFAULT TRUE,
    "leaveAllowance" INTEGER DEFAULT 12,
    "isMarried" BOOLEAN DEFAULT FALSE,
    "marriageAnniversary" TIMESTAMP WITH TIME ZONE,
    "documents" JSONB DEFAULT '{}',
    "profileVerified" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist in case the table already existed
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "position" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "salary" DOUBLE PRECISION;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT 'employee';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "dateOfJoining" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "reportingManagerId" INTEGER;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "technicalReportingId" INTEGER;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "administrativeReportingId" INTEGER;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "leaveAllowance" INTEGER DEFAULT 12;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isMarried" BOOLEAN DEFAULT FALSE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "marriageAnniversary" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "documents" JSONB DEFAULT '{}';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "profileVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "otp" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "otpExpiry" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add self-referencing foreign key constraints
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_reportingManagerId_fkey";
ALTER TABLE "Users" ADD CONSTRAINT "Users_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Users"("id") ON DELETE SET NULL;

ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_technicalReportingId_fkey";
ALTER TABLE "Users" ADD CONSTRAINT "Users_technicalReportingId_fkey" FOREIGN KEY ("technicalReportingId") REFERENCES "Users"("id") ON DELETE SET NULL;

ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_administrativeReportingId_fkey";
ALTER TABLE "Users" ADD CONSTRAINT "Users_administrativeReportingId_fkey" FOREIGN KEY ("administrativeReportingId") REFERENCES "Users"("id") ON DELETE SET NULL;


-- 2. Attendances Table
CREATE TABLE "Attendances" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP WITH TIME ZONE,
    "checkOut" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(50) DEFAULT 'Absent' CHECK ("status" IN ('Present', 'Absent', 'Leave', 'Holiday', 'Over-time')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendances_userId_date_unique" UNIQUE ("userId", "date")
);

-- 3. Projects Table
CREATE TABLE "Projects" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(50) DEFAULT 'Planning' CHECK ("status" IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
    "completion" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vacancies Table
CREATE TABLE "Vacancies" (
    "id" SERIAL PRIMARY KEY,
    "jobRole" VARCHAR(255) NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "positionTitle" VARCHAR(255) NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "experienceRequired" VARCHAR(255) NOT NULL,
    "employmentType" VARCHAR(50) NOT NULL CHECK ("employmentType" IN ('Full-Time', 'Part-Time', 'Contract', 'Internship')),
    "numberOfEmployeesRequired" INTEGER NOT NULL,
    "hiredEmployeesCount" INTEGER DEFAULT 0,
    "priorityLevel" VARCHAR(50) NOT NULL CHECK ("priorityLevel" IN ('Low', 'Medium', 'High', 'Urgent')),
    "salaryRange" VARCHAR(255),
    "jobDescription" TEXT NOT NULL,
    "lastDateToApply" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Active' CHECK ("status" IN ('Active', 'Inactive', 'Closed')),
    "createdById" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. HiringCandidates Table
CREATE TABLE "HiringCandidates" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "vacancyId" INTEGER REFERENCES "Vacancies"("id") ON DELETE SET NULL,
    "resumeUrl" VARCHAR(255) DEFAULT '#',
    "dateAdded" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "interviewScheduledDate" VARCHAR(255) DEFAULT NULL,
    "interviewScheduledTime" VARCHAR(255) DEFAULT NULL,
    "interviewResult" VARCHAR(50) DEFAULT 'Pending' CHECK ("interviewResult" IN ('Pending', 'Shortlisted', 'Not Shortlisted')),
    "taskSentDate" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    "taskReviewed" VARCHAR(50) DEFAULT 'Pending' CHECK ("taskReviewed" IN ('Pending', 'Reviewed')),
    "taskResult" VARCHAR(50) DEFAULT 'Pending' CHECK ("taskResult" IN ('Pending', 'Shortlisted', 'Not Shortlisted')),
    "hrRoundScheduledDate" VARCHAR(255) DEFAULT NULL,
    "hrRoundScheduledTime" VARCHAR(255) DEFAULT NULL,
    "hrRoundResult" VARCHAR(50) DEFAULT 'Pending' CHECK ("hrRoundResult" IN ('Pending', 'Selected', 'Rejected')),
    "offerLetterStatus" VARCHAR(50) DEFAULT 'Pending' CHECK ("offerLetterStatus" IN ('Pending', 'Sent')),
    "joiningLetterStatus" VARCHAR(50) DEFAULT 'Pending' CHECK ("joiningLetterStatus" IN ('Pending', 'Sent')),
    "finalMailSent" VARCHAR(50) DEFAULT 'No' CHECK ("finalMailSent" IN ('No', 'Yes')),
    "status" VARCHAR(255) DEFAULT 'Added',
    "logs" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Holidays Table
CREATE TABLE "Holidays" (
    "id" SERIAL PRIMARY KEY,
    "date" DATE NOT NULL UNIQUE,
    "description" VARCHAR(256) NOT NULL,
    "type" VARCHAR(50) DEFAULT 'CUSTOM' CHECK ("type" IN ('WEEKEND', 'CUSTOM')),
    "createdById" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Leaves Table
CREATE TABLE "Leaves" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "reason" TEXT NOT NULL,
    "fromDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "toDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "totalDays" DOUBLE PRECISION,
    "type" VARCHAR(255) DEFAULT 'Annual Leave',
    "status" VARCHAR(50) DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'Approved', 'Rejected')),
    "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE "Notifications" (
    "id" SERIAL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('employee', 'leader', 'admin', 'hr')),
    "readStatus" BOOLEAN DEFAULT FALSE,
    "triggeredById" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "recipientId" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ResetTokens Table
CREATE TABLE "ResetTokens" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Salaries Table
CREATE TABLE "Salaries" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION DEFAULT 0,
    "totalCredited" DOUBLE PRECISION,
    "presentDays" INTEGER,
    "absentDays" INTEGER,
    "dailyRate" DOUBLE PRECISION,
    "daysInMonth" INTEGER,
    "month" VARCHAR(255),
    "year" INTEGER,
    "creditedOn" TIMESTAMP WITH TIME ZONE,
    "isCredited" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tasks Table
CREATE TABLE "Tasks" (
    "id" SERIAL PRIMARY KEY,
    "projectId" INTEGER NOT NULL REFERENCES "Projects"("id") ON DELETE CASCADE,
    "assignedById" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "assignedToId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'In Progress', 'Completed')),
    "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "delayCount" INTEGER DEFAULT 0,
    "delayHistory" JSONB DEFAULT '[]',
    "completionDescription" TEXT,
    "deployedLink" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Teams Table
CREATE TABLE "Teams" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "leaderId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-Many: Team Projects
CREATE TABLE "TeamProjects" (
    "teamId" INTEGER NOT NULL REFERENCES "Teams"("id") ON DELETE CASCADE,
    "projectId" INTEGER NOT NULL REFERENCES "Projects"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("teamId", "projectId")
);

-- Many-to-Many: Team Members
CREATE TABLE "TeamMembers" (
    "teamId" INTEGER NOT NULL REFERENCES "Teams"("id") ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("teamId", "userId")
);

-- 13. Profiles Table
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

