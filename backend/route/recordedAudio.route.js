import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import recordedUpload from "../middleware/recordedUpload.Middleware.js";
import handleMulterError from "../middleware/multerError.middleware.js";
import { uploadRecordedAudio } from "../controller/recordedAudio.controller.js";

const router = express.Router();

//? frontend should send multipart/form-data with field name: "recording"
router.post("/upload-recording", isUserAuthenticated, recordedUpload.single("recording"), handleMulterError, uploadRecordedAudio);

export default router;

