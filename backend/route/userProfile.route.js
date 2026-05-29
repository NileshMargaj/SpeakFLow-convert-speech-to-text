import express from "express";
import { isUserAuthenticated } from "../middleware/auth.Middleware.js";
import User from "../model/user.model.js";

const router = express.Router();

// GET /api/auth/me
router.get("/me", isUserAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user id not found in token",
      });
    }

    const user = await User.findById(userId).select("username email").lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
      error: error.message,
    });
  }
});

export default router;

