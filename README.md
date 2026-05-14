# HodorInfo Backend API

> REST API for the HodorInfo corporate portal — handles job applications (ATS) and contact form emails.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)

---

## Stack

`Node.js` · `TypeScript` · `Express 5` · `Prisma 6` · `PostgreSQL (Neon)` · `Zod` · `Nodemailer`

---

## Getting Started

### 1. Install & Configure

```bash
git clone https://github.com/hodorinfo/hodor_backend.git
cd hodor_backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=recipient@gmail.com
PORT=5000
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords.

### 2. Set Up Database

Because migration history is intentionally not pushed to GitHub, you will need to push the Prisma schema directly to your new database or create a fresh local migration.

Option A — Push schema directly (Recommended for quick start):
```bash
npx prisma db push
```

Option B — Create a fresh local migration:
```bash
npx prisma migrate dev --name init
```

> ⚠️ **Windows:** Stop the dev server before running the above commands to avoid a file lock error (`EPERM`) on the Prisma query engine file.

### 3. Run

```bash
npm run dev
# → http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/applications` | Submit a job application |
| `GET` | `/api/applications` | Get all applications |
| `POST` | `/api/contact` | Send contact email |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npx prisma migrate dev` | Create & apply a new migration |
| `npx prisma studio` | Visual database browser |

---

## Related

- **Frontend:** [hodorinfo/hodorinfo](https://github.com/hodorinfo/hodorinfo) — React + Vite

---

## License

ISC
