import express from "express";
import { getStockLogs } from "../controllers/stockLogController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getStockLogs);

export default router;
