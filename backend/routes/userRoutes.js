import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserProfile); // Add delete route
router.get("/", protect, getUsers);

export default router;