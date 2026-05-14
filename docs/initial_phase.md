# HodorInfo Career System - Initial Phase Documentation

## 1. Project Overview
The HodorInfo Career System is a high-performance Applicant Tracking System (ATS) module. It handles dynamic candidate applications, multi-section resumes, and a streamlined HR dashboard for recruitment management.

---

## 2. Refined Backend Architecture
We use a **Layered Architecture (N-Tier)** to ensure scalability, testability, and separation of concerns.

### Logic Layers:
1.  **API/Routes Layer**: Handles HTTP requests and routing.
2.  **Middleware Layer**: Manages Validation (Zod) and Error Handling.
3.  **Controller Layer**: Orchestrates the request/response flow.
4.  **Service Layer**: Contains **Business Logic**. Handles data transformations and DB transactions.
5.  **Repository Layer**: Direct interaction with the Database via Prisma ORM.
6.  **Database Layer**: PostgreSQL (Relational) for structured data storage.

---

## 3. Database Schema (Prisma)

### Main Tables & Relationships
- **Jobs**: Available positions (Title, Dept, Description).
- **Candidates**: Primary candidate info (Personal details, contact, bio).
- **Education/Experience/Projects/Certifications**: Relational tables linked to `candidate_id`.
- **Skills**: A master list of skills.
- **CandidateSkills**: Junction table for Many-to-Many relationship between Candidates and Skills.

### Visual ERD Logic:
- `Jobs` 1:N `Candidates` (One job can have many applicants)
- `Candidates` 1:N `Educations`
- `Candidates` 1:N `Experiences`
- `Candidates` 1:N `Projects`
- `Candidates` N:M `Skills` (via `CandidateSkills`)

---

## 4. User Flow & Workflow

### A. Candidate User Flow
1.  **Browse**: Candidate visits the Career Page.
2.  **Select**: Clicks on an "Available Job".
3.  **Form Entry**: Fills out the Dynamic Application Form (Multi-step or long scroll).
4.  **Submit**: Clicks submit.
5.  **Confirmation**: Receives a success message.

### B. Admin/HR User Flow
1.  **Login**: Secure HR login.
2.  **Dashboard**: Sees summary of applications (Total, New, Shortlisted).
3.  **Filter**: Searches candidates by Skill (e.g., "React"), Job Role, or Experience.
4.  **Review**: Opens a candidate profile to see all details (Education, Projects, etc.).
5.  **Action**: Updates status (Shortlist / Reject / Interview).

### C. Technical Workflow
1.  **Frontend**: React Hook Form collects candidate data.
2.  **Request**: Frontend sends JSON data to `/api/applications`.
3.  **Validation**: Zod verifies data types and required fields.
4.  **Transaction**: Prisma starts a **Database Transaction** to ensure all tables (Candidate, Education, etc.) are updated or none are.
5.  **Success**: API returns 201 Created.

---

## 5. Implementation Roadmap

### Phase 1: Environment & Boilerplate
- Initialize Node.js + TypeScript.
- Setup Prisma with PostgreSQL (Neon/Local).

### Phase 2: Core API Development
- **Validators**: Define Zod schemas for the massive candidate object.
- **Routes**: Create the `/applications` POST endpoint.
- **Services**: Implement logic to handle relational data creation in Prisma.

### Phase 3: Advanced Features
- **Search & Filter**: Implementation of complex SQL queries for ATS filtering.
- **Admin Dashboard APIs**: GET endpoints for HR view.
- **Email Notifications**: Integration with Nodemailer/SendGrid.

---

## 6. Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Server
PORT=5000
NODE_ENV=development
```
