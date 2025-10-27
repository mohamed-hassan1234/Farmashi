import express from "express";
import { generateReport, getReports, getReportById } from "../controllers/reportController.js";

const router = express.Router();

// Generate new report
router.post("/",  generateReport);

// Get all reports
router.get("/",  getReports);

// Get single report by ID
router.get("/:id",  getReportById);

export default router;
