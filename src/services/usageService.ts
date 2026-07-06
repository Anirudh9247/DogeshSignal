import { PlanType } from "../plans/plans";
import { PLAN_ENTITLEMENTS } from "../plans/entitlements";

interface UsageData {
  analysesToday: number;
  lastReset: string; // Format: YYYY-MM-DD
}

function getUsageKey(email: string | null): string {
  return email ? `dogesh_usage_${email}` : "dogesh_usage_guest";
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export const usageService = {
  // Retrieve the current day's usage record
  async getUsage(email: string | null): Promise<UsageData> {
    const key = getUsageKey(email);
    const data = localStorage.getItem(key);
    const today = getTodayDateString();
    
    if (!data) {
      return { analysesToday: 0, lastReset: today };
    }
    
    try {
      const parsed: UsageData = JSON.parse(data);
      if (parsed.lastReset !== today) {
        // Automatically reset for a new calendar day
        return { analysesToday: 0, lastReset: today };
      }
      return parsed;
    } catch {
      return { analysesToday: 0, lastReset: today };
    }
  },

  // Check if the user is within their plan's limit
  async checkDailyLimit(email: string | null, plan: PlanType): Promise<boolean> {
    const entitlements = PLAN_ENTITLEMENTS[plan];
    if (!entitlements) return true;
    
    const limit = entitlements.analysesPerDay;
    if (limit === Infinity) return true;
    
    const usage = await this.getUsage(email);
    return usage.analysesToday < limit;
  },

  // Increment the usage counter by 1
  async incrementUsage(email: string | null): Promise<void> {
    const key = getUsageKey(email);
    const usage = await this.getUsage(email);
    usage.analysesToday += 1;
    localStorage.setItem(key, JSON.stringify(usage));
  },

  // Force reset the daily count (e.g. on new subscription or debugging)
  async resetDailyUsage(email: string | null): Promise<void> {
    const key = getUsageKey(email);
    const today = getTodayDateString();
    localStorage.setItem(key, JSON.stringify({ analysesToday: 0, lastReset: today }));
  }
};
