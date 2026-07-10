import { AnalysisResult } from "../types/analysis";
import { localHistoryService } from "./localHistoryService";
import { supabaseHistoryService } from "./supabaseHistoryService";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { PlanType, getMockUser, PLAN_ENTITLEMENTS } from "../plans/subscription";

export interface HistoryStorage {
  saveHistory(history: AnalysisResult[]): Promise<void>;
  loadHistory(): Promise<AnalysisResult[]>;
}

async function getActiveUserPlan(): Promise<PlanType> {
  if (isSupabaseConfigured()) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (profile?.plan) return profile.plan as PlanType;
    }
  } else {
    const user = getMockUser();
    if (user) return user.plan;
  }
  return PlanType.SNIFF;
}

export async function getStorageStrategy(): Promise<HistoryStorage> {
  const isUserLoggedIn = isSupabaseConfigured()
    ? (await supabase.auth.getUser()).data.user !== null
    : getMockUser() !== null;

  if (isUserLoggedIn) {
    const plan = await getActiveUserPlan();
    if (PLAN_ENTITLEMENTS[plan].cloudHistory) {
      return supabaseHistoryService;
    }
  }
  return localHistoryService;
}

