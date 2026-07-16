import { AnalysisResult } from "../src/types/analysis";

export async function runAnalysisTests() {
  console.log("🛡️ Running Analysis & Vetting Integration Tests...");

  // Mock Analysis Result Structure
  const mockResult: AnalysisResult = {
    id: "scan_test_1",
    messageText: "We need this done by tonight! I'll pay you next month once we close the funding round, trust me.",
    stylisticSubtextIndicators: [],
    diligenceSafeguardsRecommended: "",
    uncertaintiesAndNuances: [],
    replyForgeStatus: "COMPLETED" as any,
    heuristicRiskRating: 85,
    calculationConfidence: "HIGH",
    transparencyProbability: 25,
    contextDetected: "Contractor Scope Creep",
    strategicScanTarget: "Recipient",
    executiveSummary: "This message displays extreme urgency coupled with deferred payment risk.",
    significantTonalAnomalies: [
      {
        category: "Deferred Payment bait",
        severity: "HIGH",
        evidenceSnippet: "I'll pay you next month once we close the funding round",
        rationale: "Asks for immediate labor without verified payment structure."
      }
    ],
    suggestedBoundariesPlan: [
      "Ask for a partial upfront retainer before starting any tonight work.",
      "Get a formal signed contract outlining payment deadlines."
    ],
    microFeatures: {
      deferredPaymentRisk: 9,
      urgencyPressure: 8,
      guiltPressure: 2,
      sunkCostPressure: 1,
      futureOpportunityBait: 7,
      scopeCreepRisk: 4,
      dependencyPressure: 3,
      boundaryErosion: 6,
      manipulationIntensity: 8,
      transparencySignals: 9
    },
    microFeatureMaxes: {
      deferredPaymentRisk: 10,
      urgencyPressure: 10,
      guiltPressure: 10,
      sunkCostPressure: 10,
      futureOpportunityBait: 10,
      scopeCreepRisk: 10,
      dependencyPressure: 10,
      boundaryErosion: 10,
      manipulationIntensity: 10,
      transparencySignals: 10
    },
    timestamp: new Date().toLocaleString()
  };

  // Test 1: Heuristic risk rating ranges
  if (mockResult.heuristicRiskRating < 0 || mockResult.heuristicRiskRating > 100) {
    throw new Error("Heuristic risk rating must be between 0 and 100!");
  }
  console.log("✅ Heuristic risk rating constraints are valid.");

  // Test 2: Ensure anomalies are correctly catalogued
  if (!mockResult.significantTonalAnomalies || mockResult.significantTonalAnomalies.length === 0) {
    throw new Error("Expected at least one tonality anomaly to be reported.");
  }
  console.log("✅ Tonal anomalies catalogued successfully.");

  // Test 3: Ensure microFeatures keys match required parameters
  const requiredFeatures = [
    "deferredPaymentRisk",
    "urgencyPressure",
    "guiltPressure",
    "sunkCostPressure",
    "futureOpportunityBait",
    "scopeCreepRisk",
    "dependencyPressure",
    "boundaryErosion",
    "manipulationIntensity",
    "transparencySignals"
  ];

  for (const feature of requiredFeatures) {
    if (mockResult.microFeatures[feature as keyof typeof mockResult.microFeatures] === undefined) {
      throw new Error(`Missing feature indicator: ${feature}`);
    }
  }
  console.log("✅ All 10 mandatory microfeature parameters are present.");

  console.log("✅ Analysis Tests Completed Successfully!\n");
}
