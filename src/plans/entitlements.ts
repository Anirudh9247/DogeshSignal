import { PlanType } from "./plans";

export interface Entitlements {
  analysesPerDay: number;
  cloudHistory: boolean;
  exportSummary: boolean;
  advancedReplies: boolean;
  patternTracking?: boolean;
}

export const PLAN_ENTITLEMENTS: Record<PlanType, Entitlements> = {
  [PlanType.SNIFF]: {
    analysesPerDay: 10,
    cloudHistory: false,
    exportSummary: false,
    advancedReplies: false
  },
  [PlanType.GUARD]: {
    analysesPerDay: 100,
    cloudHistory: true,
    exportSummary: true,
    advancedReplies: true
  },
  [PlanType.SHIELD]: {
    analysesPerDay: Infinity,
    cloudHistory: true,
    exportSummary: true,
    advancedReplies: true,
    patternTracking: true
  }
};
