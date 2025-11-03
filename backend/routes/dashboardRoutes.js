// routes/dashboardRoutes.js
import express from "express";
import { getSummary } from "../controllers/dashboardController.js";

const router = express.Router();

/**
 * GET /api/dashboard/summary
 * query params: start=YYYY-MM-DD, end=YYYY-MM-DD
 */
router.get("/dashboard/summary", getSummary);

export default router;
