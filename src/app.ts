import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
import applicationRoutes from "./routes/application.routes.js";
import mailRoutes from "./routes/mail.routes.js";

app.use("/api/applications", applicationRoutes);
app.use("/api/contact", mailRoutes);

export default app;
