import { Router } from "express";
import { analyzeMessage, translateText } from "../controllers/analysis.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/analyze", requireAuth, analyzeMessage);
router.post("/translate", requireAuth, translateText);

export default router;

