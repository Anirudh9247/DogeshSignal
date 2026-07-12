import { Router } from "express";
import { analyzeMessage } from "../controllers/analysis.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/analyze", requireAuth, analyzeMessage);

export default router;
