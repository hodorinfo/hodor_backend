import { Request, Response } from "express";
import mailService from "../services/mail.service.js";

export class MailController {
  async sendContactMessage(req: Request, res: Response) {
    const { fullName, email, companyName, serviceOfInterest, message } = req.body;

    // Basic Validation
    if (!fullName || !email || !serviceOfInterest || !message) {
      return res.status(400).json({
        message: "Missing required fields: fullName, email, serviceOfInterest, and message are required.",
      });
    }

    try {
      await mailService.sendContactEmail({
        fullName,
        email,
        companyName,
        serviceOfInterest,
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Your message has been sent successfully!",
      });
    } catch (error) {
      console.error("Email sending error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send the message. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
}

export default new MailController();
