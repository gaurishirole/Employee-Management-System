# 💼 Employee Management System (EMS)

A comprehensive, enterprise-ready, role-based Employee Management System built with a robust React/Vite/Tailwind frontend, a modern Node.js/Express backend, and a PostgreSQL database.

---

## 🚀 Key Features

This system provides rich, role-based dashboards and controls tailored to four specific organizational roles: **Admin**, **HR**, **Manager / Team Leader**, and **Employee**.

### 1. 🛡️ Admin Portal
* **User Management (CRUD):** Complete control to register, view, update, and delete employees, team leaders, HR, and other administrators.
* **Holiday Management:** Set company holidays that apply globally to all employees' calendars.
* **Team & Project Creation:** Define organizational structure by creating teams, designating leaders, and assigning projects.
* **Attendance Oversight:** View real-time attendance logs filtered by date and export attendance/task reports.
* **System-Wide Reports:** Generate graphical analytical reports (via Recharts) on task delays, employee performance, and payroll.

### 2. 👥 Human Resources (HR) Portal
* **Document Verification:** Review uploaded employee verification documents (Aadhar, PAN, Certificates, etc.) and approve or unverify them.
* **Hiring Pipeline:**
  * **Vacancy Management:** Post and manage active job vacancies.
  * **Candidate Management:** Add candidates, track candidate progress, and send automated transactional updates/emails.
* **Official Letters & Emails:** Generate and send official letters (e.g., Offer Letters, Experience Letters) with file attachments directly to employee emails.
* **Payroll & Salary Management:**
  * Calculate monthly salary payouts based on attendance logs.
  * Credit salaries securely.
  * Preview and generate professional PDF salary slips (using PDFKit).

### 3. 👔 Manager / Team Leader Portal
* **Team Supervision:** View team rosters, track individual team member performance, and monitor active projects.
* **Task Assignment:** Create and assign tasks to team members with set deadlines.
* **Leave & Holiday Tracking:** Monitor team calendar and holidays.
* **Attendance Logs:** Review daily checkout/check-in logs for direct reports.
* **Vacancy Requests:** Request vacancies and manage recruitment inputs.

### 4. 🧑‍💼 Employee Portal
* **Interactive Dashboard:** View personal stats, pending tasks, holidays, and celebrations.
* **Self-Attendance:** Simple one-click Check-in and Check-out interface.
* **Task Workspace:** View assigned tasks and transition status (e.g., Todo ➡️ In Progress ➡️ Under Review ➡️ Completed).
* **Leave Management:** Apply for leaves, track approval history, and view remaining leave allowance.
* **Profile Verification:** Upload official documents for verification by HR/Admin.
* **Contact Directory:** Browse and search employee contact info inside the organization.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | React Router DOM, Tailwind CSS, Radix UI, Lucide Icons, Recharts, React Hook Form, Sonner, Zod |
| **Backend** | Node.js, Express | Sequelize ORM, PostgreSQL Client (pg), JWT, BcryptJS, Nodemailer, PDFKit, ImageKit, Multer |
| **Database** | PostgreSQL | SQL schema with relationships, constraints, and audit fields |

---

## ⚙️ Project Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [PostgreSQL](https://www.postgresql.org/) database

### 1. Database Configuration
1. Create a database in PostgreSQL.
2. Run the SQL schema script located at `EmsBackend/database/database.sql` to initialize all database tables, constraints, and initial data structures.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd EmsBackend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in `.env`:
   * Set `DB_URI` to your PostgreSQL database connection URL.
   * Add ImageKit and Nodemailer credentials for full letter generation and image upload support.
5. Run in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd EmsFrontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.
