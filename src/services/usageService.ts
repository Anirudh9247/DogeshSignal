import { PlanType } from "../plans/plans";
import { PLAN_ENTITLEMENTS } from "../plans/entitlements";
import { supabase, handleSupabaseCall } from "./supabaseClient";

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
    const today = getTodayDateString();

    const supabaseGet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { analysesToday: 0, lastReset: today };
      }

      const { data, error } = await supabase
        .from("usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        // Record might not exist yet, insert one
        const { error: insErr } = await supabase
          .from("usage")
          .insert({ user_id: user.id, analyses_today: 0, last_reset: new Date().toISOString() });
        if (insErr) throw insErr;
        return { analysesToday: 0, lastReset: today };
      }

      const dbResetDate = new Date(data.last_reset).toISOString().split("T")[0];
      if (dbResetDate !== today) {
        // Automatically reset for a new calendar day
        const { error: updErr } = await supabase
          .from("usage")
          .update({ analyses_today: 0, last_reset: new Date().toISOString() })
          .eq("user_id", user.id);
        if (updErr) throw updErr;
        return { analysesToday: 0, lastReset: today };
      }

      return {
        analysesToday: data.analyses_today,
        lastReset: dbResetDate,
      };
    };

    const mockGet = async () => {
      const key = getUsageKey(email);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return { analysesToday: 0, lastReset: today };
      }
      
      try {
        const parsed: UsageData = JSON.parse(data);
        if (parsed.lastReset !== today) {
          return { analysesToday: 0, lastReset: today };
        }
        return parsed;
      } catch {
        return { analysesToday: 0, lastReset: today };
      }
    };

    return handleSupabaseCall(supabaseGet, mockGet, "Failed to retrieve usage count");
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
    const supabaseInc = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const usage = await this.getUsage(email);
      const { error } = await supabase
        .from("usage")
        .update({ analyses_today: usage.analysesToday + 1 })
        .eq("user_id", user.id);
      if (error) throw error;
    };

    const mockInc = async () => {
      const key = getUsageKey(email);
      const usage = await this.getUsage(email);
      usage.analysesToday += 1;
      localStorage.setItem(key, JSON.stringify(usage));
    };

    return handleSupabaseCall(supabaseInc, mockInc, "Failed to increment usage count");
  },

  // Force reset the daily count (e.g. on new subscription or debugging)
  async resetDailyUsage(email: string | null): Promise<void> {
    const supabaseReset = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("usage")
        .update({ analyses_today: 0, last_reset: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;
    };

    const mockReset = async () => {
      const key = getUsageKey(email);
      const today = getTodayDateString();
      localStorage.setItem(key, JSON.stringify({ analysesToday: 0, lastReset: today }));
    };

    return handleSupabaseCall(supabaseReset, mockReset, "Failed to reset usage count");
  }
};
