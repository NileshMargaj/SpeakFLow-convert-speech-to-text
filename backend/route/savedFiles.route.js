import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import rateLimit from "../middleware/rateLimit.middleware.js";
import { listSavedFiles } from "../controller/savedFiles.controller.js";

const router = express.Router();

// GET /api/saved/files?page=1&limit=10
router.get(
  "/files",
  isUserAuthenticated,
  rateLimit({ windowMs: 60_000, max: 10 }),
  listSavedFiles
);

export default router;

