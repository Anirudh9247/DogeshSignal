import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/rateLimit.middleware";
import { 
  createSubscription, 
  verifyPayment, 
  getSubscription, 
  getUsage, 
  restoreSubscription, 
  cancelSubscription 
} from "../controllers/payment.controller";

const router = Router();

router.post("/payments/create-subscription", requireAuth, rateLimiter(10, 60000), createSubscription);
router.post("/payments/verify-payment", requireAuth, rateLimiter(10, 60000), verifyPayment);
router.get("/subscription", requireAuth, getSubscription);
router.get("/usage", requireAuth, getUsage);
router.post("/restore-subscription", requireAuth, restoreSubscription);
router.post("/cancel-subscription", requireAuth, cancelSubscription);

export default router;
