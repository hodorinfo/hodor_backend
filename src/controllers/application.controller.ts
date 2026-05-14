import { Request, Response } from "express";
import applicationService from "../services/application.service.js";
import { createApplicationSchema } from "../validators/application.validator.js";
import { ZodError } from "zod";

export class ApplicationController {
  async submitApplication(req: Request, res: Response) {
    try {
      // 1. Validate Request Body
      const validatedData = createApplicationSchema.parse(req.body);

      // 2. Call Service to save data
      const result = await applicationService.createApplication(validatedData);

      // 3. Return Success
      return res.status(201).json({
        message: "Application submitted successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error,
        });
      }

      console.error("Submission error:", error);
      return res.status(500).json({
        message: "An internal server error occurred",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async getAllApplications(req: Request, res: Response) {
    try {
      const applications = await applicationService.getApplications();
      return res.status(200).json({
        data: applications,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({
        message: "Failed to fetch applications",
      });
    }
  }
}

export default new ApplicationController();
