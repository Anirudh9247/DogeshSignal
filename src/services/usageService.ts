import { PlanType, PLAN_ENTITLEMENTS } from "../plans/subscription";
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

  // Check if the user is within their plan's limit or has credit packs
  async checkDailyLimit(email: string | null, plan: PlanType): Promise<boolean> {
    const allowance = await this.checkUsageAllowance(email, plan);
    return allowance.allowed;
  },

  // Evaluates daily limits and prepaid pack credits availability returning the allowed state and source
  async checkUsageAllowance(email: string | null, plan: PlanType): Promise<{ allowed: boolean; source: "plan" | "credit" | "blocked" }> {
    const entitlements = PLAN_ENTITLEMENTS[plan];
    if (!entitlements) return { allowed: true, source: "plan" };
    
    const limit = entitlements.limits["analysis.daily"];
    if (limit === Infinity) return { allowed: true, source: "plan" };
    
    const usage = await this.getUsage(email);
    if (usage.analysesToday < limit) {
      return { allowed: true, source: "plan" };
    }

    // Daily limit exceeded, check prepaid credits
    const packCredits = await this.getRemainingPackCredits(email);
    if (packCredits > 0) {
      return { allowed: true, source: "credit" };
    }

    return { allowed: false, source: "blocked" };
  },

  // Retrieve remaining prepaid pack credits
  async getRemainingPackCredits(email: string | null): Promise<number> {
    const supabaseGetCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      
      const { data: packs, error } = await supabase
        .from("credit_packs")
        .select("*")
        .eq("user_id", user.id)
        .gt("remaining_credits", 0);
        
      if (error || !packs) return 0;
      
      const now = new Date();
      let totalValid = 0;
      
      for (const pack of packs) {
        if (pack.expires_at && new Date(pack.expires_at) <= now) {
          // Mark as expired (deduct to 0)
          await supabase
            .from("credit_packs")
            .update({ remaining_credits: 0 })
            .eq("id", pack.id);
            
          // Record EXPIRY transaction
          await supabase.from("credit_transactions").insert({
            user_id: user.id,
            amount: -pack.remaining_credits,
            type: "EXPIRY",
            metadata: { description: "Credit pack expired", packId: pack.id }
          });
        } else {
          totalValid += pack.remaining_credits;
        }
      }
      return totalValid;
    };

    const mockGetCredits = async () => {
      const savedCredits = localStorage.getItem("dogesh_pack_credits");
      return savedCredits ? parseInt(savedCredits, 10) : 0;
    };

    return handleSupabaseCall(supabaseGetCredits, mockGetCredits, "Failed to retrieve pack credits");
  },

  // Increment the usage counter by 1, consuming credit pack if plan limit exceeded
  async incrementUsage(email: string | null, plan: PlanType): Promise<void> {
    const entitlements = PLAN_ENTITLEMENTS[plan];
    const limit = entitlements ? entitlements.limits["analysis.daily"] : 0;

    const supabaseInc = async () => {
      // No-op on the client: the secure backend server automatically verifies limits
      // and increments the usage or deducts credit packs during the /api/analyze API call.
      return;
    };

    const mockInc = async () => {
      const usage = await this.getUsage(email);
      if (limit !== Infinity && usage.analysesToday >= limit) {
        const currentCredits = await this.getRemainingPackCredits(email);
        if (currentCredits > 0) {
          localStorage.setItem("dogesh_pack_credits", String(currentCredits - 1));
        }
      } else {
        const key = getUsageKey(email);
        usage.analysesToday += 1;
        localStorage.setItem(key, JSON.stringify(usage));
      }
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
