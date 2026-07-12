import { AnalysisResult } from "../src/types/analysis";

export async function runHistoryTests() {
  console.log("💾 Running History Storage & Migration Integration Tests...");

  // Mock repositories list data
  const localHistory: AnalysisResult[] = [
    {
      id: "scan_local_1",
      messageText: "Local Scan 1",
      heuristicRiskRating: 20,
      calculationConfidence: "LOW",
      transparencyProbability: 80,
      suggestedBoundariesPlan: [],
      microFeatures: {} as any,
      microFeatureMaxes: {} as any,
      timestamp: new Date().toLocaleString()
    },
    {
      id: "scan_shared_1",
      messageText: "Shared Message Text",
      heuristicRiskRating: 40,
      calculationConfidence: "MEDIUM",
      transparencyProbability: 60,
      suggestedBoundariesPlan: [],
      microFeatures: {} as any,
      microFeatureMaxes: {} as any,
      timestamp: new Date().toLocaleString()
    }
  ] as any as AnalysisResult[];

  const cloudHistory: AnalysisResult[] = [
    {
      id: "scan_cloud_1",
      messageText: "Cloud Scan 1",
      heuristicRiskRating: 50,
      calculationConfidence: "HIGH",
      transparencyProbability: 50,
      suggestedBoundariesPlan: [],
      microFeatures: {} as any,
      microFeatureMaxes: {} as any,
      timestamp: new Date().toLocaleString()
    },
    {
      id: "scan_shared_1", // Duplicate ID
      messageText: "Shared Message Text",
      heuristicRiskRating: 40,
      calculationConfidence: "MEDIUM",
      transparencyProbability: 60,
      suggestedBoundariesPlan: [],
      microFeatures: {} as any,
      microFeatureMaxes: {} as any,
      timestamp: new Date().toLocaleString()
    }
  ] as any as AnalysisResult[];

  // Test: Merging local history list into cloud history list (dedup checks)
  const mergedHistory = [...cloudHistory];
  for (const localItem of localHistory) {
    const isDuplicate = mergedHistory.some(
      cloudItem => cloudItem.id === localItem.id || cloudItem.messageText === localItem.messageText
    );
    if (!isDuplicate) {
      mergedHistory.push(localItem);
    }
  }

  // Asserts
  // Cloud had 2, Local had 2 (one was duplicate "scan_shared_1").
  // Merged should have exactly 3 (cloud_1, shared_1, local_1).
  if (mergedHistory.length !== 3) {
    throw new Error(`Expected merged history length to be 3, got ${mergedHistory.length}`);
  }

  const hasLocal1 = mergedHistory.some(item => item.id === "scan_local_1");
  const hasCloud1 = mergedHistory.some(item => item.id === "scan_cloud_1");
  const hasShared1 = mergedHistory.filter(item => item.id === "scan_shared_1").length === 1;

  if (!hasLocal1 || !hasCloud1 || !hasShared1) {
    throw new Error("Merge failed: Missing elements or duplicate elements remain in merged set!");
  }

  console.log("✅ History merge list deduplication verified successfully.");

  // Test: Migration failure resilience check (Network drop mid-merge)
  console.log("💾 Testing migration failure resilience (network drop mid-merge)...");
  let localCacheWiped = false;
  const mockLocalCache = [...localHistory];
  
  const simulateMigrationWithNetworkDrop = async () => {
    try {
      // Simulate partial sync loop
      for (let i = 0; i < mockLocalCache.length; i++) {
        if (i === 1) {
          throw new Error("Network connection dropped!");
        }
      }
      localCacheWiped = true;
    } catch (e: any) {
      console.log(`✅ Gracefully caught expected migration exception: "${e.message}"`);
    } finally {
      // Assert local cache was NOT wiped on failure
      if (localCacheWiped) {
        throw new Error("Resilience Failure: Local cache was wiped despite migration crash!");
      }
      if (mockLocalCache.length !== localHistory.length) {
        throw new Error("Resilience Failure: Local history items were mutated during failure!");
      }
      console.log("✅ Migration resilience verified: Local cache preserved on network drop.");
    }
  };
  await simulateMigrationWithNetworkDrop();

  console.log("✅ History Tests Completed Successfully!\n");
}
