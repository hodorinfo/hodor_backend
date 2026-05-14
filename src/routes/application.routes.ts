import { Router } from "express";
import applicationController from "../controllers/application.controller.js";

const router = Router();

// POST /api/applications - Submit a new application
router.post("/", applicationController.submitApplication);

// GET /api/applications - Get all applications (Admin view)
router.get("/", applicationController.getAllApplications);

export default router;
