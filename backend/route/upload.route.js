import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.Middleware.js";
import handleMulterError from "../middleware/multerError.middleware.js";
import { uploadAudio, } from "../controller/upload.controller.js";

const router = express.Router();

router.post("/upload-audio", isUserAuthenticated, upload.single("audio"), handleMulterError, uploadAudio);

export default router;
