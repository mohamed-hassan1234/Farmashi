// routes/paymentRoutes.js
import express from "express";
import { 
  getPayments, 
  addPayment, 
  getPaymentsByCustomer,
  getPaymentStats 
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", getPayments);
router.post("/", addPayment);
router.get("/stats", getPaymentStats);
router.get("/customer/:customerId", getPaymentsByCustomer);

export default router;