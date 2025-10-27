// routes/saleRoutes.js
import express from "express";
import { 
  getSales, 
  addSale, 
  getSalesByCustomer  // 👈 Make sure to import this function
} from "../controllers/saleController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/sales - Get all sales
router.get("/", getSales);

// POST /api/sales - Create new sale
router.post("/", addSale);

// GET /api/sales/customer/:customerId - Get sales by customer ID 👈 ADD THIS ROUTE
router.get("/customer/:customerId", getSalesByCustomer);

export default router;