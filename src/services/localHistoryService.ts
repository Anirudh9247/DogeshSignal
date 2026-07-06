import { AnalysisResult } from "../types/analysis";
import { HistoryStorage } from "./storageStrategy";

export const localHistoryService: HistoryStorage = {
  async saveHistory(history: AnalysisResult[]): Promise<void> {
    localStorage.setItem("dogesh_premium_history", JSON.stringify(history));
  },
  
  async loadHistory(): Promise<AnalysisResult[]> {
    try {
      const data = localStorage.getItem("dogesh_premium_history");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
};
