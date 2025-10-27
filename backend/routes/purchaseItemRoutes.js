import express from "express";
import { getPurchaseItems, updatePurchaseItem, deletePurchaseItem } from "../controllers/purchaseItemController.js";

const router = express.Router();

router.get("/", getPurchaseItems);
router.put("/:id", updatePurchaseItem);
router.delete("/:id", deletePurchaseItem);

export default router;
