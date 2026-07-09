import { AnalysisResult } from "../types/analysis";
import { getStorageStrategy } from "./storageStrategy";
import { localHistoryService } from "./localHistoryService";
import { supabaseHistoryService } from "./supabaseHistoryService";

// Save history using the runtime strategy (Local Storage vs Supabase Cloud)
export async function saveHistory(history: AnalysisResult[]): Promise<void> {
  const strategy = await getStorageStrategy();
  return strategy.saveHistory(history);
}

// Load history using the runtime strategy (Local Storage vs Supabase Cloud)
export async function loadHistory(): Promise<AnalysisResult[]> {
  const strategy = await getStorageStrategy();
  return strategy.loadHistory();
}

// Merge local guest history trace into the logged-in user's Supabase cloud account
export async function importLocalHistoryToCloud(): Promise<void> {
  const localHistory = await localHistoryService.loadHistory();
  if (localHistory.length === 0) return;

  const cloudHistory = await supabaseHistoryService.loadHistory();
  
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
  await supabaseHistoryService.saveHistory(mergedHistory);

  // Clear local storage guest history cache
  await localHistoryService.saveHistory([]);
}