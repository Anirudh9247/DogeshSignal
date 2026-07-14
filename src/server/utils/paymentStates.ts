/**
 * Payment State Machine
 *
 * All payment records must transition through these states in order.
 * States are stored in the `status` column of the `payments` table.
 *
 * Transition diagram:
 *
 *   PENDING ──► AUTHORIZED ──► CAPTURED
 *      │             │
 *      ▼             ▼
 *   CANCELLED      FAILED
 *                    │
 *                    ▼
 *                REFUNDED
 *
 * Subscription-only:
 *   CAPTURED ──► EXPIRED  (at cycle end)
 *   CAPTURED ──► CANCELLED (user or admin cancel)
 */
export enum PaymentStatus {
  /** Order created, awaiting payment from user */
  PENDING = "PENDING",

  /** Bank/card authorized the charge but not yet captured */
  AUTHORIZED = "AUTHORIZED",

  /** Payment fully captured and confirmed — plan is active */
  CAPTURED = "CAPTURED",

  /** Payment attempt failed (insufficient funds, declined, etc.) */
  FAILED = "FAILED",

  /** Payment was refunded after capture */
  REFUNDED = "REFUNDED",

  /** Order or subscription was cancelled before or after capture */
  CANCELLED = "CANCELLED",

  /** Subscription reached its end date without renewal */
  EXPIRED = "EXPIRED"
}

/** States where the subscription/order is considered active and granting access */
export const ACTIVE_STATES = new Set<PaymentStatus>([
  PaymentStatus.AUTHORIZED,
  PaymentStatus.CAPTURED
]);

/** States where no further transitions should occur (terminal) */
export const TERMINAL_STATES = new Set<PaymentStatus>([
  PaymentStatus.REFUNDED,
  PaymentStatus.CANCELLED,
  PaymentStatus.EXPIRED
]);

/** Returns true if this status grants active plan access */
export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATES.has(status as PaymentStatus);
}

/** Returns true if no further state transitions should be applied */
export function isTerminalState(status: string): boolean {
  return TERMINAL_STATES.has(status as PaymentStatus);
}

/**
 * Maps Razorpay webhook event names to the corresponding PaymentStatus.
 * Used by the webhook controller to keep status transitions consistent.
 */
export const WEBHOOK_EVENT_STATUS_MAP: Record<string, PaymentStatus> = {
  "subscription.activated":  PaymentStatus.CAPTURED,
  "subscription.charged":    PaymentStatus.CAPTURED,
  "subscription.resumed":    PaymentStatus.CAPTURED,
  "payment.authorized":      PaymentStatus.AUTHORIZED,
  "subscription.paused":     PaymentStatus.PENDING,    // grace period
  "subscription.halted":     PaymentStatus.PENDING,    // retry exhausted
  "payment.failed":          PaymentStatus.FAILED,
  "subscription.pending":    PaymentStatus.PENDING,
  "subscription.cancelled":  PaymentStatus.CANCELLED,
  "subscription.completed":  PaymentStatus.EXPIRED
};
