import { PLAN_AMOUNTS, PLAN_IDS, PlanType } from "../src/plans/subscription";

export async function runPricingConsistencyTests() {
  console.log("💳 Running Pricing Consistency Tests...");

  const expectedAmounts = {
    [PlanType.SNIFF]: 0,
    [PlanType.GUARD_MONTHLY]: 499,
    [PlanType.GUARD_ANNUAL]: 4900,
    [PlanType.SHIELD_MONTHLY]: 1299,
    [PlanType.SHIELD_ANNUAL]: 12900
  };

  const expectedIds = {
    [PlanType.SNIFF]: null,
    [PlanType.GUARD_MONTHLY]: "plan_guard_monthly_live_128938129",
    [PlanType.GUARD_ANNUAL]: "plan_guard_yearly_live_128938130",
    [PlanType.SHIELD_MONTHLY]: "plan_shield_monthly_live_128938131",
    [PlanType.SHIELD_ANNUAL]: "plan_shield_yearly_live_128938132"
  };

  // 1. Verify Amounts
  for (const plan of Object.values(PlanType)) {
    if (PLAN_AMOUNTS[plan] !== expectedAmounts[plan]) {
      throw new Error(`Pricing amount mismatch for plan '${plan}': expected ${expectedAmounts[plan]} cents, but found ${PLAN_AMOUNTS[plan]} cents.`);
    }
  }

  // 2. Verify Razorpay Plan IDs
  for (const plan of Object.values(PlanType)) {
    if (PLAN_IDS[plan] !== expectedIds[plan]) {
      throw new Error(`Razorpay plan ID mismatch for plan '${plan}': expected '${expectedIds[plan]}', but found '${PLAN_IDS[plan]}'.`);
    }
  }

  console.log("✅ Verified: Shared frontend and backend pricing constants match the spec exactly.");
}
