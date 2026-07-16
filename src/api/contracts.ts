// src/api/contracts.ts

import { AnalysisResult } from "../types/analysis";

export interface AnalyzeRequest {
  message: string;
  enableReplyForge: boolean;
}

export interface AnalyzeResponse extends AnalysisResult {}