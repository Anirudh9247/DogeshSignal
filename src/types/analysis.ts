export interface MicroFeatures {
  deferredPaymentRisk: number;
  urgencyPressure: number;
  guiltPressure: number;
  sunkCostPressure: number;
  futureOpportunityBait: number;
  scopeCreepRisk: number;
  dependencyPressure: number;
  boundaryErosion: number;
  manipulationIntensity: number;
  transparencySignals: number;
}

export interface SignificantTonalAnomaly {
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rationale: string;
  evidenceSnippet: string;
}

export interface StylisticSubtextIndicator {
  hint: string;
  whyItMatters: string;
}

export interface AnalysisResult {
  heuristicRiskRating: number;
  transparencyProbability: number;
  calculationConfidence: "LOW" | "MEDIUM" | "HIGH";
  contextDetected: string;
  strategicScanTarget: string;
  executiveSummary: string;
  microFeatures: MicroFeatures;
  microFeatureMaxes: MicroFeatures;
  significantTonalAnomalies: SignificantTonalAnomaly[];
  stylisticSubtextIndicators: StylisticSubtextIndicator[];
  suggestedBoundariesPlan: string[];
  diligenceSafeguardsRecommended: string;
  uncertaintiesAndNuances: string[];
  replyForgeStatus: "Active" | "Inactive";
  replies?: {
    professional: string;
    bold: string;
    supportive: string;
  };
  timestamp?: string;
  id?: string;
  messageText?: string;
}
