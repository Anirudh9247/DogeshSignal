import { Router } from "express";
import { analyzeMessage } from "../controllers/analysis.controller";

const router = Router();

router.post("/analyze", analyzeMessage);

export default router;
