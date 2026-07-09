import { Router } from "express";
import { checkHealth, getVersion } from "../controllers/health.controller";

const router = Router();

router.get("/health", checkHealth);
router.get("/version", getVersion);

export default router;
