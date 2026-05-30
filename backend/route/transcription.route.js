import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import {
  transcribeUploadedAudioById,
  transcribeRecordedAudioById,
} from "../controller/transcription.controller.js";

const router = express.Router();

// Transcribe already-uploaded audio (stored in ImageKit)
router.post(
  "/transcribe/uploaded/:audioId",
  isUserAuthenticated,
  transcribeUploadedAudioById
);

// Transcribe already-recorded audio (stored in ImageKit)
router.post(
  "/transcribe/recorded/:recordedAudioId",
  isUserAuthenticated,
  transcribeRecordedAudioById
);

export default router;

