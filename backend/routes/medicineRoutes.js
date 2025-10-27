import express from "express";
import { getMedicines, addMedicine, updateMedicine, deleteMedicine, adjustStock } from "../controllers/medicineController.js";
// import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",  getMedicines);
router.post("/",  addMedicine);
router.put("/:id",  updateMedicine);
router.delete("/:id",  deleteMedicine);
router.post("/:id/stock",  adjustStock);

export default router;
