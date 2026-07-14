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
import { createOrder, verifyOrder } from "../controllers/order.controller";
import {
  validateCreateOrder,
  validateVerifyOrder,
  validateCreateSubscription
} from "../middleware/validatePayment.middleware";

const router = Router();

// ── Subscription-based Checkout (recurring billing via Razorpay Subscriptions) ──
// Input validated before hitting the controller; auth + rate-limit enforced.
router.post(
  "/payments/create-subscription",
  requireAuth,
  rateLimiter(10, 60000),
  validateCreateSubscription,
  createSubscription
);
router.post(
  "/payments/verify-payment",
  requireAuth,
  rateLimiter(10, 60000),
  verifyPayment
);
router.get("/subscription",          requireAuth, getSubscription);
router.get("/usage",                 requireAuth, getUsage);
router.post("/restore-subscription", requireAuth, restoreSubscription);
router.post("/cancel-subscription",  requireAuth, cancelSubscription);

// ── Standard Checkout (one-time order via Razorpay Orders API) ───────────────
// validateCreateOrder strips any client-supplied amount before it reaches the controller.
// validateVerifyOrder checks Razorpay field presence and format.
router.post(
  "/payments/create-order",
  requireAuth,
  rateLimiter(10, 60000),
  validateCreateOrder,
  createOrder
);
router.post(
  "/payments/verify-order",
  requireAuth,
  rateLimiter(10, 60000),
  validateVerifyOrder,
  verifyOrder
);

export default router;
