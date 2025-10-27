import express from "express";
import { getPurchases, addPurchase,updatePurchase,getPurchaseById } from "../controllers/purchaseController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getPurchases);
router.get("/:id", protect, getPurchaseById);

router.post("/", protect, addPurchase);
router.put("/:id", protect, updatePurchase);

export default router;
