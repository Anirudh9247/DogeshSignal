import {
  AnalyzeRequest,
  AnalyzeResponse,
} from "../api/contracts";

const API_BASE = "/api";

// Core API caller function
export async function analyze(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  return response.json();
}

// Wrapper function a
export async function analyzeMessage(
  request: AnalyzeRequest
): Promise<any> { 
  const data = await analyze(request);

  //  captures the exact time of the analysis
  const metadata = {
    id: `DS-${Date.now()}`,
    analyzedAt: new Date().toLocaleString(),
    storage: "Local Device",
    model: "Gemini Pro model"
  };

  return {
    ...data,
    metadata
  };
}