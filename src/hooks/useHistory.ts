import { useState } from "react";
import { AnalysisResult } from "../types/analysis";
import { loadHistory, saveHistory } from "../services/history/history.service";

export function useHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("ALL");

  const fetchHistory = async () => {
    try {
      const logs = await loadHistory();
      setHistory(logs);
      return logs;
    } catch (e) {
      console.error("Failed to fetch history:", e);
      return [];
    }
  };

  const updateHistory = async (newHistory: AnalysisResult[]) => {
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const getFilteredHistory = () => {
    return history.filter(item => {
      const textMatches = item.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.contextDetected?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!textMatches) return false;

      if (historyFilter === "ALL") return true;
      if (historyFilter === "HIGH_RISK") return item.heuristicRiskRating > 50;
      if (historyFilter === "SAFE") return item.heuristicRiskRating <= 35;
      
      if (historyFilter === "FREELANCE") return item.contextDetected?.includes("Freelance");
      if (historyFilter === "RECRUITING") return item.contextDetected?.includes("HR") || item.contextDetected?.includes("Hiring");
      
      return true;
    });
  };

  return {
    history,
    setHistory,
    searchQuery,
    setSearchQuery,
    historyFilter,
    setHistoryFilter,
    fetchHistory,
    updateHistory,
    getFilteredHistory
  };
}
