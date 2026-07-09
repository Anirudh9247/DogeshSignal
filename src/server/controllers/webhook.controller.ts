import { Request, Response } from "express";
import { supabaseAdmin, isSupabaseConfiguredBackend } from "../utils/supabase";
import { logEvent } from "../utils/logger";
import crypto from "crypto";

export async function processWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBodyString = (req as any).rawBody ? (req as any).rawBody.toString() : "";

    // 1. Webhook Signature Verification
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== "placeholder-webhook-secret") {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBodyString)
        .digest("hex");

      if (expectedSignature !== signature) {
        logEvent("ERROR", "Webhook signature verification failed");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    } else {
      logEvent("WARN", "Webhook signature bypassed (secret not set or placeholder)");
    }

    const body = req.body;
    const event = body.event;

    // Extract details
    const subscription = body.payload?.subscription?.entity;
    const payment = body.payload?.payment?.entity;
    const subscriptionId = subscription?.id || body.payload?.entity?.subscription_id;
    const paymentId = payment?.id || body.payload?.entity?.id;
    const amount = payment?.amount || subscription?.amount || 0;
    const currency = payment?.currency || subscription?.currency || "USD";

    // Extract notes metadata
    const notes = subscription?.notes || {};
    const userId = notes.userId;
    const planType = notes.planType || "guard";

    // Webhook Replay Protection using Event ID
    const webhookEventId = body.id || (body.created_at ? `evt_${body.created_at}` : `evt_unknown_${Date.now()}`);

    logEvent("INFO", "Webhook received from Razorpay", { event, subscriptionId, paymentId, webhookEventId });

    if (isSupabaseConfiguredBackend()) {
      // 2. Replay Protection Event Check
      const { data: duplicateCheck } = await supabaseAdmin
        .from("payment_logs")
        .select("id")
        .eq("payload->>webhook_event_id", webhookEventId)
        .maybeSingle();

      if (duplicateCheck) {
        logEvent("INFO", "Duplicate webhook event ID ignored (Replay Protection)", { webhookEventId });
        return res.json({ status: "ok", message: "Duplicate event ID ignored" });
      }

      // Log Webhook event
      await supabaseAdmin.from("payment_logs").insert({
        user_id: userId || null,
        event_type: `webhook.${event}`,
        payload: { ...body, webhook_event_id: webhookEventId }
      });

      // 3. Idempotency Check for transactions
      if (paymentId && (event === "subscription.charged" || event === "payment.authorized")) {
        const { data: existingPayment } = await supabaseAdmin
          .from("payments")
          .select("*")
          .eq("payment_id", paymentId)
          .maybeSingle();

        if (existingPayment && existingPayment.verified) {
          logEvent("INFO", "Payment transaction already verified (Idempotency skip)", { paymentId });
          return res.json({ status: "ok", message: "Idempotent duplicate ignored." });
        }
      }

      // 4. Process Event States
      if (event === "subscription.charged" || event === "payment.authorized" || event === "subscription.activated" || event === "subscription.resumed") {
        await supabaseAdmin.from("payments").upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          payment_id: paymentId,
          amount,
          currency,
          status: "ACTIVE",
          verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: "payment_id" });

        await supabaseAdmin
          .from("profiles")
          .update({
            plan: planType,
            plan_status: "ACTIVE"
          })
          .eq("id", userId);

        logEvent("INFO", `Webhook processed subscription activation/resume successfully (${event})`, { userId, planType, subscriptionId });
      } else if (event === "subscription.paused") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "PAST_DUE", updated_at: new Date().toISOString() })
          .eq("subscription_id", subscriptionId);

        await supabaseAdmin
          .from("profiles")
          .update({ plan_status: "PAST_DUE" })
          .eq("id", userId);

        logEvent("INFO", "Webhook processed subscription paused state", { subscriptionId, userId });
      } else if (event === "subscription.cancelled" || event === "subscription.completed") {
        const status = event === "subscription.cancelled" ? "CANCELLED" : "EXPIRED";
        
        await supabaseAdmin
          .from("payments")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("subscription_id", subscriptionId);

        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "sniff",
            plan_status: status
          })
          .eq("id", userId);

        logEvent("INFO", `Webhook processed subscription termination state: ${status}`, { subscriptionId, userId });
      } else if (event === "subscription.halted") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "PAST_DUE", updated_at: new Date().toISOString() })
          .eq("subscription_id", subscriptionId);

        await supabaseAdmin
          .from("profiles")
          .update({ plan_status: "PAST_DUE" })
          .eq("id", userId);

        logEvent("INFO", "Webhook processed subscription past-due/halted state", { subscriptionId, userId });
      } else if (event === "payment.failed") {
        await supabaseAdmin.from("payments").upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          payment_id: paymentId,
          amount,
          currency,
          status: "FAILED",
          verified: false,
          updated_at: new Date().toISOString()
        }, { onConflict: "payment_id" });

        await supabaseAdmin
          .from("profiles")
          .update({ plan_status: "FAILED" })
          .eq("id", userId);

        logEvent("INFO", "Webhook processed payment failure state", { subscriptionId, userId, paymentId });
      } else if (event === "subscription.pending") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "PENDING", updated_at: new Date().toISOString() })
          .eq("subscription_id", subscriptionId);

        await supabaseAdmin
          .from("profiles")
          .update({ plan_status: "PENDING" })
          .eq("id", userId);

        logEvent("INFO", "Webhook processed subscription pending state", { subscriptionId, userId });
      }
    } else {
      logEvent("WARN", "Mock Mode: Webhook parsed with no DB updates", { event });
    }

    return res.json({ status: "ok" });
  } catch (error: any) {
    logEvent("ERROR", "Webhook processing failed with exception", { error: error.message });
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
