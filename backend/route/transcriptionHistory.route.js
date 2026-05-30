import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import rateLimit from "../middleware/rateLimit.middleware.js";
import { listTranscriptionHistory } from "../controller/transcriptionHistory.controller.js";

const router = express.Router();

// GET /api/transcription/history?page=1&limit=10
router.get(
  "/history",
  isUserAuthenticated,
  rateLimit({ windowMs: 60_000, max: 10 }),
  listTranscriptionHistory
);

export default router;

