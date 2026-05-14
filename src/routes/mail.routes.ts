import { Router } from "express";
import mailController from "../controllers/mail.controller.js";

const router = Router();

// POST /api/contact - Send a contact message via email
router.post("/", mailController.sendContactMessage);

export default router;
