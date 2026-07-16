import { Router } from "express";
import { processWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/payments/webhook", processWebhook);

export default router;
