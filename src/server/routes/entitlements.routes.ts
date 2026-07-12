import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/rateLimit.middleware";
import { getUserEntitlements } from "../controllers/entitlements.controller";

const router = Router();

router.get("/entitlements", requireAuth, rateLimiter(30, 60000), getUserEntitlements);

export default router;
