import express from "express";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from "../controllers/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getSuppliers);
router.post("/", protect, addSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);

export default router;
