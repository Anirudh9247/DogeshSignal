import { useState } from "react";
import { AnalysisResult } from "../types/analysis";
import { useAuth } from "../context/AuthContext";
import { clientFetch } from "../utils/clientFetch";

export type ScanErrorType = "LIMIT" | "SERVER" | "AI_UNAVAILABLE" | "AUTH" | "GENERIC" | null;

export function useScan() {
  const { token } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ScanErrorType>(null);
  const [activeDogLog, setActiveDogLog] = useState("Ready to analyze a message.");

  const loadingMessages = [
    "Checking message text...",
    "Connecting to secure gateway (cold start might take up to a minute)...",
    "Looking for high-pressure requests & sudden urgencies...",
    "Highlighting emotional triggers & missing boundaries...",
    "Checking details on timelines & commitments...",
    "Drafting respectful & firm boundary replies..."
  ];

  const triggerScan = async (forcedText?: string) => {
    const finalText = (forcedText || messageText).trim();
    if (!finalText) {
      setError("Please paste a message or thread to start scanning.");
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    setErrorType(null);
    setResult(null);
    setActiveDogLog(loadingMessages[0]);

    let msgIndex = 1;
    const interval = setInterval(() => {
      if (msgIndex < loadingMessages.length) {
        setActiveDogLog(loadingMessages[msgIndex]);
        msgIndex++;
      }
    }, 2500);

    try {
      const response = await clientFetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: finalText, enableReplyForge: true }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const status = response.status;
        let type: ScanErrorType = "GENERIC";

        if (status === 429 || status === 403) {
          type = "LIMIT";
        } else if (status === 401) {
          type = "AUTH";
        } else if (status === 503 || status === 502 || status === 504) {
          type = "AI_UNAVAILABLE";
        } else if (status === 500) {
          type = "SERVER";
        }

        const msg = errData.error || `Analyze API failed with status ${status}`;
        setError(msg);
        setErrorType(type);
        throw { message: msg, type, status };
      }

      const data: AnalysisResult = await response.json();
      const completeResult: AnalysisResult = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleDateString(undefined, { 
          month: "short", 
          day: "numeric", 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        messageText: finalText
      };

      setResult(completeResult);
      return completeResult;
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "There was a connection issue with the AI vetting gateway. Please try again.";
      const type = err?.type || "GENERIC";
      setError(msg);
      setErrorType(type);
      throw err;
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  return {
    messageText,
    setMessageText,
    isAnalyzing,
    result,
    setResult,
    error,
    setError,
    errorType,
    setErrorType,
    activeDogLog,
    setActiveDogLog,
    triggerScan
  };
}
