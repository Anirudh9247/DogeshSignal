import { AnalysisResult } from "../types/analysis";
import { HistoryStorage } from "./storageStrategy";
import { getMockUser } from "../plans/plans";
import { supabase, handleSupabaseCall } from "./supabaseClient";

const CLOUD_STORAGE_KEY = "dogesh_supabase_cloud_mock";

const safeIsoDate = (val: string | undefined): string => {
  if (!val) return new Date().toISOString();
  const parsed = Date.parse(val);
  return isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
};

export const supabaseHistoryService: HistoryStorage = {
  async saveHistory(history: AnalysisResult[]): Promise<void> {
    const supabaseSave = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current database history records
      const { data: existingRows, error: fetchErr } = await supabase
        .from("analysis_history")
        .select("id")
        .eq("user_id", user.id);

      if (fetchErr) throw fetchErr;

      const existingIds = new Set(existingRows?.map((r) => r.id) || []);
      const incomingIds = new Set(history.map((h) => h.id));

      // 1. Delete removed items
      const idsToDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("analysis_history")
          .delete()
          .in("id", idsToDelete);
        if (delErr) throw delErr;
      }

      // 2. Upsert the current list
      if (history.length > 0) {
        const rows = history.map((item) => ({
          id: item.id,
          user_id: user.id,
          message: item.messageText || "",
          analysis: item,
          metadata: { model: "Gemini 2.5 Flash", storage: "Supabase Cloud" },
          created_at: safeIsoDate(item.timestamp),
        }));

        const { error: upsertErr } = await supabase.from("analysis_history").upsert(rows);
        if (upsertErr) throw upsertErr;
      }
    };

    const mockSave = async () => {
      const user = getMockUser();
      if (!user) return;
      localStorage.setItem(`${CLOUD_STORAGE_KEY}_${user.id}`, JSON.stringify(history));
    };

    return handleSupabaseCall(supabaseSave, mockSave, "Failed to save history to cloud database");
  },

  async loadHistory(): Promise<AnalysisResult[]> {
    const supabaseLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        return data.map((row) => ({
          ...(row.analysis as AnalysisResult),
          id: row.id,
          timestamp: new Date(row.created_at).toLocaleString(),
        }));
      }
      return [];
    };

    const mockLoad = async () => {
      const user = getMockUser();
      if (!user) return [];
      try {
        const data = localStorage.getItem(`${CLOUD_STORAGE_KEY}_${user.id}`);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    };

    return handleSupabaseCall(supabaseLoad, mockLoad, "Failed to load history from cloud database");
  }
};
