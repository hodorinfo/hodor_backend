# HodorInfo – Full Project Report

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Workflow](#2-system-workflow)
   - 2.1 [High-Level Architecture](#21-high-level-architecture)
   - 2.2 [User Journey – Website Navigation](#22-user-journey--website-navigation)
   - 2.3 [Data Flow – Job Application Submission](#23-data-flow--job-application-submission)
   - 2.4 [Data Flow – Contact Form](#24-data-flow--contact-form)
3. [Developer Guide – Getting Started](#3-developer-guide--getting-started)
   - 3.1 [Prerequisites](#31-prerequisites)
   - 3.2 [Cloning & Setup](#32-cloning--setup)
   - 3.3 [Backend Setup](#33-backend-setup)
   - 3.4 [Frontend Setup](#34-frontend-setup)
   - 3.5 [Running Both Projects](#35-running-both-projects)
4. [Project Structure](#4-project-structure)
   - 4.1 [Frontend Structure](#41-frontend-structure)
   - 4.2 [Backend Structure](#42-backend-structure)
5. [Tech Stack](#5-tech-stack)
   - 5.1 [Frontend Tech Stack](#51-frontend-tech-stack)
   - 5.2 [Backend Tech Stack](#52-backend-tech-stack)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Deployment](#9-deployment)

---

## 1. Project Overview

**HodorInfo** is a full-stack web application consisting of two separate repositories:

| Repository | Path | Purpose |
|---|---|---|
| `hodorinfo` | `D:\Workoffice\hodorinfo` | React/Vite Frontend (Client Website) |
| `hodorinfo_backend` | `D:\Workoffice\hodorinfo_backend` | Node.js/Express Backend (API Server) |

The website is a corporate/IT services company portal that presents company services, industry expertise, an about page, and a careers/ATS (Applicant Tracking System) module. Users can browse open job positions, submit detailed job applications, and contact the company directly. Submitted applications are stored in a cloud-hosted PostgreSQL database (Neon), and contact messages are dispatched via Gmail SMTP.

---

## 2. System Workflow

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     BROWSER (User)                           │
│                                                              │
│   React + Vite SPA  (localhost:3000 / Vercel)                │
│   ┌─────────────────────────────────────────────────┐        │
│   │  Pages: Home, Services, Industries, About,       │        │
│   │         Contact, Career, Form (Application)       │        │
│   │                                                   │        │
│   │  Custom Hooks:                                    │        │
│   │    useApplicationForm  ──POST──► /api/applications│        │
│   │    useContactForm      ──POST──► /api/contact     │        │
│   └────────────────────┬────────────────────────────-┘        │
└────────────────────────┼─────────────────────────────────────┘
                         │  HTTP (Axios)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              EXPRESS API SERVER  (localhost:5000)             │
│                                                              │
│   ┌────────────────────────────────────────────────┐         │
│   │  Routes                                         │         │
│   │    POST /api/applications  → ApplicationCtrl    │         │
│   │    GET  /api/applications  → ApplicationCtrl    │         │
│   │    POST /api/contact       → MailCtrl           │         │
│   │    GET  /health            → Health Check       │         │
│   └───────────────┬────────────────────────────────-┘         │
│                   │                                           │
│   ┌───────────────▼────────────────────────────────┐         │
│   │  Services                                       │         │
│   │    ApplicationService  → Prisma ORM             │         │
│   │    MailService         → Nodemailer             │         │
│   └───────────────┬────────────────────────────────-┘         │
└───────────────────┼───────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│  Neon PostgreSQL │  │  Gmail SMTP           │
│  (Cloud DB)      │  │  (Contact Emails)     │
│                  │  │                       │
│  Tables:         │  │  To: hodorinfo611@    │
│  Candidate       │  │      gmail.com        │
│  Education       │  └──────────────────────┘
│  Experience      │
│  Project         │
│  Certification   │
│  Achievement     │
│  SocialLink      │
│  Skill           │
│  CandidateSkill  │
└──────────────────┘
```

---

### 2.2 User Journey – Website Navigation

```
User lands on → / (Home)
                    │
        ┌───────────┼────────────────────────────┐
        ▼           ▼                            ▼
  /services    /industries                   /about
                                                 │
                                             /contact
                                         (Contact Form)
                                                 │
                                   WhatsApp FAB (global, all pages)
                                                 │
                                           /careers
                                      (Browse open vacancies)
                                                 │
                                        /careers/form
                                    (Full multi-section
                                     ATS application form)
                                                 │
                                    Form submitted → API → DB
```

---

### 2.3 Data Flow – Job Application Submission

```
Step 1: User fills Form.tsx
        ├── Personal Info (name, dob, gender, nationality…)
        ├── Contact Details (email, phone, WhatsApp…)
        ├── Address
        ├── Professional Info (CTC, notice period…)
        ├── Education (10th, 12th, degree – dynamic rows)
        ├── Work Experience (dynamic rows)
        ├── Projects (dynamic rows)
        ├── Certifications (dynamic rows)
        ├── Achievements (dynamic rows)
        ├── Skills (multi-select tags)
        └── Social Links (dynamic rows)

Step 2: useApplicationForm.ts hook calls
        POST http://localhost:5000/api/applications
        with full JSON payload

Step 3: ApplicationController.submitApplication()
        └── Validates payload with Zod schema
            (createApplicationSchema)

Step 4: ApplicationService.createApplication()
        └── Prisma $transaction (timeout: 30s)
            ├── tx.candidate.create() — main record + nested relations
            │   ├── educations: { create: [...] }
            │   ├── experiences: { create: [...] }
            │   ├── projects: { create: [...] }
            │   ├── certifications: { create: [...] }
            │   ├── achievements: { create: [...] }
            │   └── socialLinks: { create: [...] }
            └── Loop: skills[]
                ├── tx.skill.upsert()   — create/find skill in master table
                └── tx.candidateSkill.create() — join table entry

Step 5: 201 response → toast.success("Application submitted!")
```

---

### 2.4 Data Flow – Contact Form

```
Step 1: User fills Contact.tsx form
        ├── Full Name
        ├── Email
        ├── Company Name (optional)
        ├── Service of Interest
        └── Message

Step 2: useContactForm.ts hook calls
        POST http://localhost:5000/api/contact

Step 3: MailController.sendContactMessage()
        └── Calls MailService.sendContactEmail()

Step 4: MailService uses Nodemailer
        └── SMTP: smtp.gmail.com : 587 (STARTTLS)
            Auth: EMAIL_USER / EMAIL_PASS (App Password)
            From: Sender Name <hodorinfo611@gmail.com>
            To:   hodorinfo611@gmail.com
            Reply-To: user's email

Step 5: 200 response → toast.success("Message sent!")
```

---

## 3. Developer Guide – Getting Started

### 3.1 Prerequisites

Before starting, make sure you have the following installed:

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ (LTS recommended) | Runtime for both frontend and backend |
| **pnpm** | v10+ | Package manager for the frontend |
| **npm** | v9+ | Package manager for the backend |
| **Git** | Any | Version control |
| **VS Code** | Any | Recommended editor |

> **Note:** The frontend uses `pnpm` and the backend uses `npm`. Do not mix them.

---

### 3.2 Cloning & Setup

Both projects live in the same parent folder `D:\Workoffice\`. If you are setting up on a fresh machine:

```powershell
# Navigate to your workspace root
cd D:\Workoffice

# Clone both repositories (adjust URLs as needed)
git clone <frontend-repo-url> hodorinfo
git clone <backend-repo-url> hodorinfo_backend
```

---

### 3.3 Backend Setup

**Step 1 – Navigate to the backend folder:**
```powershell
cd D:\Workoffice\hodorinfo_backend
```

**Step 2 – Install dependencies:**
```powershell
npm install
```

**Step 3 – Configure environment variables:**

Create a `.env` file in `D:\Workoffice\hodorinfo_backend\` with the following content:

```env
# PostgreSQL connection string (Neon cloud database)
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"

# Gmail SMTP credentials
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password   # Use a Gmail App Password, NOT your account password
EMAIL_TO=recipient@gmail.com
```

> **How to get a Gmail App Password:**
> 1. Go to your Google Account → Security
> 2. Enable **2-Step Verification**
> 3. Go to **App Passwords** → Create a password for "Mail"
> 4. Use that 16-character code as `EMAIL_PASS`

**Step 4 – Run Prisma migrations (set up the database):**

```powershell
npx prisma migrate deploy
```

> If you are making schema changes during development, use:
> ```powershell
> npx prisma migrate dev --name your_migration_name
> ```

**Step 5 – Generate the Prisma Client:**

```powershell
npx prisma generate
```

> **Important on Windows:** If `npm run dev` is already running, stop it before running `prisma generate` to avoid the `EPERM` file lock error on `query_engine-windows.dll.node`.

**Step 6 – Start the backend development server:**

```powershell
npm run dev
```

The server starts at: `http://localhost:5000`

Verify it works:
```powershell
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

### 3.4 Frontend Setup

**Step 1 – Navigate to the frontend folder:**
```powershell
cd D:\Workoffice\hodorinfo
```

**Step 2 – Install dependencies:**
```powershell
pnpm install
```

**Step 3 – Verify API URL (no .env needed for local dev):**

The frontend hooks are hardcoded to call `http://localhost:5000`:
- `client/src/hooks/useApplicationForm.ts` → `const API_URL = 'http://localhost:5000/api/applications'`
- `client/src/hooks/useContactForm.ts`     → `const API_URL = 'http://localhost:5000/api/contact'`

Make sure your backend is running on port `5000` before testing form submissions.

**Step 4 – Start the frontend development server:**

```powershell
pnpm dev
```

The app starts at: `http://localhost:3000`

---

### 3.5 Running Both Projects

You must run **both servers simultaneously** in two separate terminal windows:

**Terminal 1 – Backend:**
```powershell
cd D:\Workoffice\hodorinfo_backend
npm run dev
# → Server running on http://localhost:5000
```

**Terminal 2 – Frontend:**
```powershell
cd D:\Workoffice\hodorinfo
pnpm dev
# → Vite dev server on http://localhost:3000
```

Open your browser at `http://localhost:3000`.

---

## 4. Project Structure

### 4.1 Frontend Structure

```
hodorinfo/
├── client/
│   └── src/
│       ├── App.tsx                     # Root component – routing setup (wouter)
│       ├── main.tsx                    # React entry point
│       ├── index.css                   # Global CSS / design tokens
│       │
│       ├── pages/                      # Page-level components (one per route)
│       │   ├── Home.tsx                # / — Landing page
│       │   ├── Services.tsx            # /services
│       │   ├── Industries.tsx          # /industries
│       │   ├── About.tsx               # /about
│       │   ├── Contact.tsx             # /contact — Contact form page
│       │   ├── Career.tsx              # /careers — Job listings page
│       │   ├── Form.tsx                # /careers/form — Full ATS application form
│       │   └── NotFound.tsx            # 404 fallback
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navigation.tsx      # Top navigation bar (responsive)
│       │   │   ├── Footer.tsx          # Global footer
│       │   │   └── Whatsapp.tsx        # Floating WhatsApp button (global)
│       │   ├── ui/
│       │   │   ├── VacancyCard.tsx     # Job card + vacancies data
│       │   │   ├── StaticFrameContentLoop.tsx  # Animated content component
│       │   │   ├── sonner.tsx          # Toast notification wrapper
│       │   │   └── tooltip.tsx         # Tooltip component (Radix)
│       │   └── app/
│       │       └── ErrorBoundary.tsx   # React error boundary wrapper
│       │
│       ├── hooks/
│       │   ├── useApplicationForm.ts   # Handles job application API POST
│       │   └── useContactForm.ts       # Handles contact form API POST
│       │
│       ├── contexts/
│       │   └── ThemeContext.tsx        # Light/dark theme context provider
│       │
│       └── lib/                        # Utility functions (e.g., cn())
│
├── vite.config.ts                      # Vite build config, path aliases, plugins
├── package.json                        # Frontend dependencies (pnpm)
├── tsconfig.json                       # TypeScript config
├── vercel.json                         # Vercel deployment config (SPA rewrites)
└── components.json                     # shadcn/ui component config
```

---

### 4.2 Backend Structure

```
hodorinfo_backend/
├── src/
│   ├── server.ts                       # Entry point – starts Express HTTP server
│   ├── app.ts                          # Express app – CORS, JSON, route mounting
│   │
│   ├── routes/
│   │   ├── application.routes.ts       # POST /api/applications, GET /api/applications
│   │   └── mail.routes.ts              # POST /api/contact
│   │
│   ├── controllers/
│   │   ├── application.controller.ts   # Request handling for applications
│   │   └── mail.controller.ts          # Request handling for contact messages
│   │
│   ├── services/
│   │   ├── application.service.ts      # Business logic – Prisma DB operations
│   │   └── mail.service.ts             # Business logic – Nodemailer email dispatch
│   │
│   ├── validators/
│   │   └── application.validator.ts    # Zod schema for full application payload
│   │
│   └── config/
│       └── db.ts                       # PrismaClient singleton instance
│
├── prisma/
│   ├── schema.prisma                   # Database schema (all models defined here)
│   └── migrations/
│       ├── 20260513095241_init/        # Initial migration
│       └── 20260514053707_add_school_details/  # Added 10th/12th columns
│
├── .env                                # Environment variables (NOT committed to git)
├── package.json                        # Backend dependencies (npm)
└── tsconfig.json                       # TypeScript config
```

---

## 5. Tech Stack

### 5.1 Frontend Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React | 19.2.1 | UI component framework |
| **Build Tool** | Vite | 7.x | Dev server & production bundler |
| **Language** | TypeScript | 5.6.3 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **Routing** | Wouter | 3.3.5 | Lightweight React router |
| **Animations** | Framer Motion | 12.x | Spring animations, layout transitions |
| **Animations** | GSAP | 3.x | Advanced scroll & timeline animations |
| **Lottie** | @lottiefiles/dotlottie-react | 0.18.7 | Lottie animation player (WhatsApp FAB) |
| **UI Primitives** | Radix UI | Various | Accessible headless components |
| **Forms** | React Hook Form | 7.x | Performant form state management |
| **Validation** | Zod | 4.x | Schema validation (client-side) |
| **HTTP Client** | Axios | 1.x | API calls to backend |
| **Toasts** | Sonner | 2.x | Toast notification system |
| **Icons** | Lucide React | 0.453 | Icon library |
| **Carousel** | Swiper | 12.x | Touch-enabled carousels |
| **Theme** | next-themes | 0.4.6 | Light/dark mode management |
| **Package Mgr** | pnpm | 10.x | Fast, disk-efficient package manager |
| **Deployment** | Vercel | — | SPA hosting with rewrite rules |

---

### 5.2 Backend Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | 18+ | JavaScript server runtime |
| **Language** | TypeScript | 6.x | Type-safe development |
| **Framework** | Express | 5.x | HTTP server & routing |
| **ORM** | Prisma | 6.19.3 | Type-safe database client |
| **Database** | PostgreSQL (Neon) | — | Cloud-hosted relational DB |
| **Validation** | Zod | 4.x | Request body schema validation |
| **Email** | Nodemailer | 8.x | SMTP email dispatch (Gmail) |
| **Env Config** | dotenv | 17.x | Environment variable loading |
| **CORS** | cors | 2.x | Cross-Origin Resource Sharing |
| **Dev Runner** | tsx watch | 4.x | TypeScript execution + hot reload |
| **Package Mgr** | npm | 9+ | Package management |

---

## 6. Database Schema

Hosted on **Neon PostgreSQL** (cloud). Managed via Prisma Migrate.

```
┌─────────────────┐       ┌──────────────────┐
│      Job        │       │    Candidate      │
│─────────────────│       │──────────────────-│
│ id (PK, uuid)   │◄──────│ jobId (FK, opt)   │
│ title           │       │ firstName         │
│ department      │       │ middleName        │
│ location        │       │ lastName          │
│ description     │       │ gender, dob       │
│ createdAt       │       │ nationality       │
│ updatedAt       │       │ maritalStatus     │
└─────────────────┘       │ email (unique)    │
                          │ phone             │
                          │ secondaryPhone    │
                          │ whatsappNumber    │
                          │ address, city     │
                          │ state, zip        │
                          │ linkedin, github  │
                          │ objective, summary│
                          │ totalExperience   │
                          │ currentCtc        │
                          │ expectedCtc       │
                          │ noticePeriod      │
                          │ employmentStatus  │
                          │ tenthBoard        │
                          │ tenthPercentage   │
                          │ tenthYear         │
                          │ twelfthBoard      │
                          │ twelfthPercentage │
                          │ twelfthYear       │
                          │ twelfthStream     │
                          │ createdAt         │
                          │ updatedAt         │
                          └────────┬──────────┘
                                   │ 1:N
              ┌────────────────────┼────────────────────────┐
              ▼                    ▼                        ▼
     ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
     │  Education   │    │   Experience    │    │    Project       │
     │──────────────│    │─────────────────│    │──────────────────│
     │ level        │    │ jobTitle        │    │ title            │
     │ schoolOrCol  │    │ companyName     │    │ type             │
     │ boardOrUniv  │    │ role            │    │ description      │
     │ streamOrSpec │    │ employmentType  │    │ liveUrl          │
     │ passingYear  │    └─────────────────┘    │ githubUrl        │
     │ percentOrCgpa│                           └──────────────────┘
     │ courseType   │
     │ startYear    │         ┌────────────────┐    ┌──────────────────┐
     └──────────────┘         │ Certification  │    │  Achievement     │
                              │────────────────│    │──────────────────│
                              │ name           │    │ title            │
                              │ issuingOrg     │    │ orgName          │
                              └────────────────┘    │ dateReceived     │
                                                    │ description      │
     ┌──────────────┐                               └──────────────────┘
     │  SocialLink  │
     │──────────────│         Many-to-Many via CandidateSkill:
     │ platform     │         ┌─────────────┐    ┌───────────────────┐
     │ url          │         │    Skill    │    │  CandidateSkill   │
     └──────────────┘         │─────────────│    │───────────────────│
                              │ id (PK)     │◄───│ candidateId (FK)  │
                              │ name (uniq) │    │ skillId (FK)      │
                              └─────────────┘    └───────────────────┘
```

All child tables have `onDelete: Cascade` — deleting a `Candidate` removes all their related records automatically.

---

## 7. API Reference

**Base URL:** `http://localhost:5000`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

**Response:**
```json
{ "status": "ok", "timestamp": "2026-05-14T07:00:00.000Z" }
```

---

### Applications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/applications` | Submit a new job application |
| `GET` | `/api/applications` | Get all applications (admin) |

**POST `/api/applications` – Request Body (JSON):**

```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "gender": "Male",
  "dob": "2000-01-15",
  "totalExperience": "2 years",
  "currentCtc": "4 LPA",
  "expectedCtc": "7 LPA",
  "noticePeriod": "30 days",
  "tenthBoard": "CBSE",
  "tenthPercentage": "85",
  "tenthYear": "2016",
  "twelfthBoard": "CBSE",
  "twelfthPercentage": "78",
  "twelfthYear": "2018",
  "twelfthStream": "Science",
  "educations": [
    {
      "level": "Bachelor's",
      "schoolOrCollege": "Delhi University",
      "boardOrUniversity": "DU",
      "streamOrSpecialization": "Computer Science",
      "passingYear": "2022",
      "percentageOrCgpa": "8.5"
    }
  ],
  "experiences": [
    {
      "jobTitle": "Software Engineer",
      "companyName": "TechCorp",
      "role": "Frontend Developer",
      "employmentType": "Full-time"
    }
  ],
  "projects": [],
  "certifications": [],
  "achievements": [],
  "socialLinks": [],
  "skills": ["React", "TypeScript", "Node.js"]
}
```

**Responses:**

| Status | Meaning |
|---|---|
| `201 Created` | Application saved successfully |
| `400 Bad Request` | Zod validation failed (malformed fields) |
| `500 Internal Server Error` | Database or server error |

---

### Contact

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contact` | Send a contact message via email |

**POST `/api/contact` – Request Body (JSON):**

```json
{
  "fullName": "Priya Singh",
  "email": "priya@example.com",
  "companyName": "Startup XYZ",
  "serviceOfInterest": "IT Consulting",
  "message": "We would like to discuss your services."
}
```

**Responses:**

| Status | Meaning |
|---|---|
| `200 OK` | Email sent successfully |
| `500 Internal Server Error` | SMTP failure or missing env config |

---

## 8. Environment Variables Reference

The backend reads environment variables from `hodorinfo_backend/.env`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | Full PostgreSQL connection string (Neon format) |
| `EMAIL_USER` | ✅ Yes | Gmail address used to send emails (SMTP sender) |
| `EMAIL_PASS` | ✅ Yes | Gmail **App Password** (not your login password) |
| `EMAIL_TO` | ⚠️ Optional | Recipient email address (defaults to `EMAIL_USER` if not set) |
| `PORT` | ⚠️ Optional | Server port (defaults to `5000`) |

> ⚠️ **Security:** Never commit `.env` to version control. The `.gitignore` already excludes it.

---

## 9. Deployment

### Frontend (Vercel)

The frontend is configured for one-click Vercel deployment via `vercel.json`:

```json
{
  "framework": "vite",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The `rewrites` rule ensures client-side routing (wouter) works correctly on all pages — without it, direct URL access to `/careers/form` would return a 404.

**To deploy:**
1. Push `hodorinfo` to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Vercel auto-detects the `vercel.json` config

---

### Backend

The backend is a standard Node.js/Express server. Recommended deployment options:

| Platform | Notes |
|---|---|
| **Railway** | Supports Node.js + automatic deploys from GitHub |
| **Render** | Free tier available, good for small APIs |
| **Heroku** | Procfile-based deployment |
| **VPS (DigitalOcean/AWS)** | Full control, run with PM2 |

**Important:** After deploying the backend, update the API URLs in:
- `client/src/hooks/useApplicationForm.ts` — change `http://localhost:5000` → your live URL
- `client/src/hooks/useContactForm.ts` — same change

Consider moving these to an environment variable (e.g., `VITE_API_URL`) for cleaner config management.

---

*Report generated: May 2026 | HodorInfo Project*
