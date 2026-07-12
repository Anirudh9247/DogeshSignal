import { useState } from "react";
import { AnalysisResult } from "../types/analysis";
import { useAuth } from "../context/AuthContext";

export function useScan() {
  const { token } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDogLog, setActiveDogLog] = useState("Ready to analyze a message.");

  const loadingMessages = [
    "Checking message text...",
    "Looking for high-pressure requests & sudden urgencies...",
    "Highlighting emotional triggers & missing boundaries...",
    "Checking details on timelines & commitments...",
    "Drafting respectful & firm boundary replies..."
  ];

  const triggerScan = async (text: string) => {
    const finalText = text.trim();
    if (!finalText) {
      setError("Please paste a message or thread to start scanning.");
      return null;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setActiveDogLog(loadingMessages[0]);

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        setActiveDogLog(loadingMessages[msgIndex]);
      }
    }, 900);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: finalText, enableReplyForge: true }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analyze API failed with status ${response.status}`);
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
      const msg = err?.message || "There was a routing problem with the AI vetting api. Please try again.";
      setError(msg);
      throw new Error(msg);
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
    activeDogLog,
    setActiveDogLog,
    triggerScan
  };
}
