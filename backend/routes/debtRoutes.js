import express from "express";
import { getDebts, payDebt,deleteDebt, updateDebt} from "../controllers/debtController.js";
// import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",  getDebts);
router.post("/:debtId/pay",  payDebt);
router.put("/:debtId",  updateDebt);
router.delete("/:debtId",  deleteDebt);

export default router;
