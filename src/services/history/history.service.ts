import { AnalysisResult } from "../../types/analysis";
import { PlanType, PLAN_ENTITLEMENTS, getMockUser } from "../../plans/subscription";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import {
  HistoryStorage,
  localHistoryRepository,
  supabaseHistoryRepository
} from "./history.repository";

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
    if (PLAN_ENTITLEMENTS[plan].features["history.cloud"]) {
      return supabaseHistoryRepository;
    }
  }
  return localHistoryRepository;
}

export async function saveHistory(history: AnalysisResult[]): Promise<void> {
  const strategy = await getStorageStrategy();
  return strategy.saveHistory(history);
}

export async function loadHistory(): Promise<AnalysisResult[]> {
  const strategy = await getStorageStrategy();
  return strategy.loadHistory();
}

export async function importLocalHistoryToCloud(): Promise<void> {
  const localHistory = await localHistoryRepository.loadHistory();
  if (localHistory.length === 0) return;

  const cloudHistory = await supabaseHistoryRepository.loadHistory();
  
  // Merge lists to avoid duplicates (by ID or messageText match)
  const mergedHistory = [...cloudHistory];
  for (const localItem of localHistory) {
    const isDuplicate = mergedHistory.some(
      cloudItem => cloudItem.id === localItem.id || cloudItem.messageText === localItem.messageText
    );
    if (!isDuplicate) {
      mergedHistory.push(localItem);
    }
  }

  // Persist merged history to Supabase Cloud
  await supabaseHistoryRepository.saveHistory(mergedHistory);

  // Clear local storage guest history cache
  await localHistoryRepository.saveHistory([]);
}
