// Razorpay Subscription Configuration Preparation
// These Plan IDs represent target subscription links and products on the Razorpay Dashboard.
export const PLAN_IDS = {
  sniff: null, // Sniff is the free tier, no payment required
  guard_monthly: "plan_guard_monthly_live_128938129",
  guard_yearly: "plan_guard_yearly_live_128938130",
  shield_monthly: "plan_shield_monthly_live_128938131",
  shield_yearly: "plan_shield_yearly_live_128938132"
};

export interface SubscriptionConfig {
  planId: string;
  name: string;
  amount: number; // In cents (e.g. 999 is USD 9.99)
  currency: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionConfig> = {
  guard_monthly: {
    planId: PLAN_IDS.guard_monthly,
    name: "Guard Premium (Monthly)",
    amount: 999,
    currency: "USD"
  },
  guard_yearly: {
    planId: PLAN_IDS.guard_yearly,
    name: "Guard Premium (Yearly)",
    amount: 9999,
    currency: "USD"
  },
  shield_monthly: {
    planId: PLAN_IDS.shield_monthly,
    name: "Shield Ultimate (Monthly)",
    amount: 2999,
    currency: "USD"
  },
  shield_yearly: {
    planId: PLAN_IDS.shield_yearly,
    name: "Shield Ultimate (Yearly)",
    amount: 29999,
    currency: "USD"
  }
};
