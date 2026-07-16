export * from "./types/analysis";

export interface SystemNotification {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isRead: boolean;
}

