import { AnalysisResult } from "../types/analysis";
import { localHistoryService } from "./localHistoryService";
import { supabaseHistoryService } from "./supabaseHistoryService";

export interface HistoryStorage {
  saveHistory(history: AnalysisResult[]): Promise<void>;
  loadHistory(): Promise<AnalysisResult[]>;
}

export function getStorageStrategy(isLoggedIn: boolean): HistoryStorage {
  if (isLoggedIn) {
    return supabaseHistoryService;
  }
  return localHistoryService;
}
