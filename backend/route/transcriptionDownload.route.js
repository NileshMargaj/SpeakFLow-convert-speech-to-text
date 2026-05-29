import express from "express";
import { isUserAuthenticated } from "../middleware/auth.Middleware.js";
import { downloadTranscriptionById } from "../controller/transcriptionDownload.controller.js";

const router = express.Router();

// Download transcript text as .txt
// GET /api/transcription/download/:transcriptId
router.get(
  "/download/:transcriptId",
  isUserAuthenticated,
  downloadTranscriptionById
);

export default router;

