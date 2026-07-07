import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Info,
  Clock,
  Eye,
  TrendingUp,
  UserCheck,
  FileText,
  Bookmark
} from "lucide-react";
import { AnalysisResult, MicroFeatures } from "../types/analysis";
import { jsPDF } from "jspdf";


// Subtle score reveal counter
function AnimatedScore({ score, className }: { score: number; className: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 750; // smooth 750ms reveal

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress);
      setCurrent(Math.floor(easedProgress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(score);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  return <span className={className}>{current}</span>;
}

interface ResultsDashboardProps {
  theme: "light" | "dark";
  result: AnalysisResult;
  onScanAnother: () => void;
  onCopyAllResults: () => void;
  isAllCopied: boolean;
}

export function ResultsDashboard({
  theme,
  result,
  onScanAnother,
  onCopyAllResults,
  isAllCopied
}: ResultsDashboardProps) {
  const [activeReplyTone, setActiveReplyTone] = useState<"Professional" | "Direct" | "Supportive">("Professional");
  const [editedReplyText, setEditedReplyText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const textTitleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const textMutedClass = theme === "dark" ? "text-slate-400" : "text-slate-500";
  
  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl transition-all duration-200"
    : "bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md";

  const repliesMap = {
    Professional: result.replies?.professional,
    Direct: result.replies?.bold,
    Supportive: result.replies?.supportive
  };

  useEffect(() => {
    if (result) {
      setEditedReplyText(repliesMap[activeReplyTone] || "");
    }
  }, [activeReplyTone, result]);

  const handleCopyReplyText = (text: string, tone: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(tone);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2); // 180
    
    let y = 20;
    
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };
    
    // Draw Brand Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // Orange Accent
    doc.text("DOGESH SIGNAL", margin, y);
    y += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate secondary
    doc.text("Instinct Radar - Exploitative Pattern Vetting Report", margin, y);
    
    const timestampStr = new Date().toLocaleString();
    doc.text(`Report Generated: ${timestampStr}`, pageWidth - margin - doc.getTextWidth(`Report Generated: ${timestampStr}`), y);
    y += 5;
    
    // Draw Divider Line
    doc.setDrawColor(226, 232, 240); // slate border
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Draw Risk Score Panel
    checkPageBreak(30);
    const rating = result.heuristicRiskRating;
    const ratingColor = rating > 70 ? { r: 239, g: 68, b: 68 } : rating > 45 ? { r: 245, g: 158, b: 11 } : { r: 16, g: 185, b: 129 };
    const ratingText = rating > 70 ? "HIGH EXPLOITATION RISK" : rating > 45 ? "MODERATE EXPLOITATION RISK" : "LOW EXPLOITATION RISK";
    
    // Draw filled background card for Score
    doc.setFillColor(248, 250, 252); // soft slate
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "F");
    
    // Draw vertical bar on Left of card representing severity
    doc.setFillColor(ratingColor.r, ratingColor.g, ratingColor.b);
    doc.rect(margin, y, 4, 24, "F");
    
    // Render Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(ratingColor.r, ratingColor.g, ratingColor.b);
    doc.text(`${rating}`, margin + 10, y + 15);
    const ratingWidth = doc.getTextWidth(`${rating}`);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // light text
    doc.text("/100", margin + 10 + ratingWidth + 1.5, y + 15);
    
    // Render Rating Tier Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(ratingColor.r, ratingColor.g, ratingColor.b);
    doc.text(ratingText, margin + 45, y + 11);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Confidence Level: ${result.calculationConfidence}  |  Clarity Score: ${result.transparencyProbability}%`, margin + 45, y + 17);
    y += 32;
    
    // Context Info Block
    checkPageBreak(25);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("SCENARIO CONTEXT", margin + 5, y + 7);
    doc.text("TARGET AFFECTED", margin + contentWidth / 2 + 5, y + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(result.contextDetected || "General / Unknown", margin + 5, y + 13);
    doc.text(result.strategicScanTarget || "Recipient Side", margin + contentWidth / 2 + 5, y + 13);
    y += 26;
    
    // Quoted Source Evidence (with word wrap)
    const quoteText = result.messageText || "No text analyzed.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const wrapQuote = doc.splitTextToSize(`"${quoteText}"`, contentWidth - 12);
    const quoteHeight = (wrapQuote.length * 5.5) + 16;
    
    checkPageBreak(quoteHeight);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, quoteHeight, 2, 2, "FD");
    
    // Draw a clean text header instead of tiny filled rectangle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(249, 115, 22); // Orange Accent
    doc.text("ANALYZED MESSAGE TEXT", margin + 6, y + 7);
    
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(wrapQuote, margin + 6, y + 14);
    y += quoteHeight + 8;
    
    // Section: Why It Feels Off (Executive Summary)
    const summary = result.executiveSummary || "";
    if (summary) {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(249, 115, 22);
      doc.text("EXECUTIVE ANALYSIS", margin, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const wrapSummary = doc.splitTextToSize(summary, contentWidth);
      checkPageBreak(wrapSummary.length * 5.5);
      doc.text(wrapSummary, margin, y);
      y += (wrapSummary.length * 5.5) + 10;
    }
    
    // Section: Signals to Notice (Anomalies)
    if (result.significantTonalAnomalies && result.significantTonalAnomalies.length > 0) {
      checkPageBreak(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(249, 115, 22);
      doc.text("DETAILED RISK INDICATORS", margin, y);
      y += 6;
      
      for (const anomaly of result.significantTonalAnomalies) {
        const severityStr = anomaly.severity || "MEDIUM";
        const isHigh = severityStr === "HIGH" || severityStr === "CRITICAL";
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(isHigh ? 220 : 217, isHigh ? 38 : 119, isHigh ? 38 : 6); // red or amber
        const headerText = `${anomaly.category} [Severity: ${severityStr}]`;
        
        const evidenceLines = doc.splitTextToSize(`Evidence: "${anomaly.evidenceSnippet}"`, contentWidth - 10);
        const rationaleLines = doc.splitTextToSize(anomaly.rationale, contentWidth - 10);
        const totalHeight = 6 + (evidenceLines.length * 5) + (rationaleLines.length * 5) + 6;
        
        checkPageBreak(totalHeight);
        
        // Draw card background
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentWidth, totalHeight, 2, 2, "FD");
        
        doc.text(headerText, margin + 5, y + 6);
        
        let cardY = y + 11;
        doc.setFont("helvetica", "oblique");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(evidenceLines, margin + 7, cardY);
        
        cardY += (evidenceLines.length * 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(rationaleLines, margin + 5, cardY);
        
        y += totalHeight + 4;
      }
      y += 4;
    }
    
    // Section: Boundary Tips
    if (result.suggestedBoundariesPlan && result.suggestedBoundariesPlan.length > 0) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(249, 115, 22);
      doc.text("RECOMMENDED BOUNDARY GUIDELINES", margin, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      
      let stepNum = 1;
      for (const tip of result.suggestedBoundariesPlan) {
        const wrapTip = doc.splitTextToSize(tip, contentWidth - 10);
        const tipHeight = wrapTip.length * 5;
        checkPageBreak(tipHeight);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(249, 115, 22);
        doc.text(`${stepNum}.`, margin, y);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(wrapTip, margin + 7, y);
        
        y += tipHeight + 2;
        stepNum++;
      }
      y += 6;
    }
    
    // Section: Pre-composed Counterdrafts
    if (result.replies) {
      checkPageBreak(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(249, 115, 22);
      doc.text("COUNTERDRAFT RESPONSE TEMPLATES", margin, y);
      y += 6;
      
      if (result.replies.professional) {
        const profLines = doc.splitTextToSize(`"${result.replies.professional}"`, contentWidth - 10);
        const profHeight = (profLines.length * 5) + 12;
        checkPageBreak(profHeight);
        
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, profHeight, 2, 2, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("Option 1: Professional & Objective", margin + 5, y + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(profLines, margin + 5, y + 12);
        
        y += profHeight + 4;
      }
      
      if (result.replies.bold) {
        const boldLines = doc.splitTextToSize(`"${result.replies.bold}"`, contentWidth - 10);
        const boldHeight = (boldLines.length * 5) + 12;
        checkPageBreak(boldHeight);
        
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, boldHeight, 2, 2, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("Option 2: Direct & Assertive", margin + 5, y + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(boldLines, margin + 5, y + 12);
        
        y += boldHeight + 4;
      }
    }
    
    // Save Document
    doc.save(`dogesh-vetting-report-${Date.now()}.pdf`);
  };

  const formatFeatureLabel = (key: string) => {
    const customLabels: Record<string, string> = {
      deferredPaymentRisk: "Payment risk",
      urgencyPressure: "Urgency",
      guiltPressure: "Guilt",
      sunkCostPressure: "Sunk cost",
      futureOpportunityBait: "Vague promises",
      scopeCreepRisk: "Scope changes",
      dependencyPressure: "Relationship pressure",
      boundaryErosion: "Boundary requests",
      manipulationIntensity: "Pressure patterns",
      transparencySignals: "Low transparency",
    };
    if (customLabels[key]) return customLabels[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatSeverity = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case "LOW": return "Low";
      case "MEDIUM": return "Medium";
      case "HIGH": return "High";
      case "CRITICAL": return "Critical";
      default: return "Medium";
    }
  };

  return (
    <div className="space-y-10 my-4 text-left" id="results_dashboard_root">
      
      {/* ACTION HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-900 pb-4" id="results_header_actions">
        <button
          onClick={onScanAnother}
          className={`px-4 py-2 bg-transparent hover:bg-slate-500/5 text-xs font-semibold rounded-lg border transition-all duration-155 transform active:scale-98 flex items-center gap-1.5 cursor-pointer font-sans ${
            theme === "dark" ? "border-slate-800 text-slate-400 hover:text-slate-200" : "border-slate-200 text-slate-600 hover:text-slate-950"
          }`}
          id="results_btn_back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to analyzer</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-sans text-slate-400 dark:text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Private analysis</span>
        </div>
      </div>

      {/* 1. RISK LEVEL AND METRICS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} relative overflow-hidden text-left`}
        id="results_above_the_fold"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Risk Score Meter */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-800/80 pb-6 lg:pb-0 lg:pr-8">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Risk level
            </span>
            <div className="flex items-baseline gap-0.5" id="risk_score_numeric_block">
              <AnimatedScore 
                score={result.heuristicRiskRating} 
                className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${
                  result.heuristicRiskRating > 70 
                    ? "text-rose-500" 
                    : result.heuristicRiskRating > 45 
                    ? "text-amber-500" 
                    : "text-emerald-500"
                }`}
              />
              <span className="text-slate-400 font-sans text-base">/100</span>
            </div>
            
            <div className="pt-1">
              <span className={`text-[11px] font-sans font-semibold px-3 py-0.5 rounded-full border inline-block ${
                result.heuristicRiskRating > 70 
                  ? "text-rose-500 bg-rose-500/5 border-rose-500/10" 
                  : result.heuristicRiskRating > 45 
                  ? "text-amber-500 bg-amber-500/5 border-amber-500/10" 
                  : "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
              }`}>
                {result.heuristicRiskRating > 70 ? "High risk" : result.heuristicRiskRating > 45 ? "Moderate risk" : "Low risk"}
              </span>
            </div>
          </div>

          {/* Core metadata stats */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pl-0 lg:pl-3">
            
            <div className="space-y-1.5" id="meta_confidence">
              <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 block pb-0.5 font-sans">
                Confidence
              </span>
              <p className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 font-sans">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  result.calculationConfidence === "HIGH" ? "bg-emerald-500" : result.calculationConfidence === "MEDIUM" ? "bg-amber-500" : "bg-slate-400"
                }`} />
                {result.calculationConfidence}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block leading-none">
                Reliability level
              </span>
            </div>

            <div className="space-y-1.5" id="meta_transparency">
              <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 block pb-0.5 font-sans">
                Clarity
              </span>
              <p className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                {result.transparencyProbability}%
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block leading-none">
                Clarity signals
              </span>
            </div>

            <div className="space-y-1.5" id="meta_message_type">
              <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 block pb-0.5 font-sans">
                Context
              </span>
              <p className="text-sm font-bold text-slate-855 dark:text-slate-100 truncate font-sans" title={result.contextDetected}>
                {result.contextDetected || "General"}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block leading-none">
                Target scenario
              </span>
            </div>

            <div className="space-y-1.5" id="meta_who_pressured">
              <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 block pb-0.5 font-sans">
                Affected side
              </span>
              <p className="text-sm font-bold text-slate-855 dark:text-slate-100 truncate font-sans" title={result.strategicScanTarget}>
                {result.strategicScanTarget || "Recipient"}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block leading-none">
                Who is pressured
              </span>
            </div>

          </div>

        </div>
      </motion.div>

      {/* 2. MAIN SYMMETRICAL COLUMNS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        id="results_primary_decision_area"
      >
        
        {/* LEFT COLUMN: Explanation & Signals */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4`} id="card_why_flagged">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
              <Info className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Why it feels off
              </h3>
            </div>
            
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 italic font-sans font-medium">
              "{result.executiveSummary || "This message creates pressure by mixing urgency, unclear expectations, or emotional leverage."}"
            </p>
          </div>

          <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4`} id="card_red_flags">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Signals to notice
              </h3>
            </div>

            {result.significantTonalAnomalies && result.significantTonalAnomalies.length > 0 ? (
              <div className="space-y-3.5">
                {result.significantTonalAnomalies.map((anomaly, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all duration-150 ${
                      theme === "dark" ? "bg-slate-950/40 border-slate-850/60" : "bg-slate-50 border-slate-200 shadow-3xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-orange-500 font-sans">
                        {anomaly.category}
                      </span>
                      <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded transition-transform ${
                        anomaly.severity === "HIGH" || anomaly.severity === "CRITICAL"
                          ? "bg-rose-500/5 text-rose-500 border border-rose-500/10"
                          : "bg-amber-500/5 text-amber-500 border border-amber-500/10"
                      }`}>
                        {formatSeverity(anomaly.severity)}
                      </span>
                    </div>

                    <div className="pl-3 border-l-2 border-orange-550/30 font-sans text-xs text-slate-500 dark:text-slate-400 italic">
                      "{anomaly.evidenceSnippet}"
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                      {anomaly.rationale}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 font-sans text-xs text-slate-400">
                No strong pressure signals were detected.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Suggested reply & Boundary Tips */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4`} id="card_suggested_reply">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Suggested reply
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-sans font-semibold">Editable draft</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
              Choose a tone, then edit the reply to fit your situation.
            </p>

            {/* Tone option tabs (Professional, Direct, Supportive sentence-case) */}
            <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 font-sans text-xs select-none flex">
              {(["Professional", "Direct", "Supportive"] as const).map((tone) => {
                const isActive = activeReplyTone === tone;
                return (
                  <button
                    key={tone}
                    onClick={() => setActiveReplyTone(tone)}
                    className={`flex-grow text-center py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-xs font-semibold ${
                      isActive 
                        ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border border-slate-200/50 dark:border-slate-800 shadow-3xs" 
                        : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>

            {/* Render selected reply inside editable textarea */}
            <div className={`p-4 rounded-xl border space-y-4 relative ${
              theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
            }`}>
              <textarea
                value={editedReplyText}
                onChange={(e) => setEditedReplyText(e.target.value)}
                className={`w-full min-h-[110px] rounded-xl border p-3.5 text-xs outline-none focus:border-orange-500/50 transition-all font-sans leading-relaxed resize-y ${
                  theme === "dark" 
                    ? "bg-slate-950/40 border-slate-850 text-slate-200 focus:bg-slate-950" 
                    : "bg-white border-slate-250 text-slate-800 focus:bg-white"
                }`}
                placeholder="Choose a tone above..."
              />

              {/* User quick customization helpers */}
              <div className="flex flex-wrap gap-1.5 pt-1.5 select-none font-sans">
                <button
                  onClick={() => setEditedReplyText(prev => prev + "\n\nBest regards,\n[Your Name]")}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                  title="Append professional email signature"
                >
                  + Add Signature
                </button>
                <button
                  onClick={() => {
                    const sentences = editedReplyText.split(". ");
                    if (sentences.length > 2) {
                      setEditedReplyText(sentences.slice(0, 2).join(". ") + (sentences[1].endsWith(".") ? "" : "."));
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                  title="Trim reply to first two sentences"
                >
                  ⚡ Make Shorter
                </button>
                <button
                  onClick={() => setEditedReplyText(prev => prev + "\n\nLet me know if we can schedule a quick call to align on this.")}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                  title="Append meeting scheduling request"
                >
                  📅 Ask for Call
                </button>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-150 dark:border-slate-900/60 font-sans">
                <button
                  onClick={() => handleCopyReplyText(editedReplyText, activeReplyTone)}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-sans font-semibold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 border-none shadow-sm"
                >
                  {copiedKey === activeReplyTone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-950" />
                      <span>Copy reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4`} id="card_recommended_boundaries">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
              <UserCheck className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Boundary tips
              </h3>
            </div>

            {result.suggestedBoundariesPlan && result.suggestedBoundariesPlan.length > 0 ? (
              <div className="space-y-3 font-sans text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                {result.suggestedBoundariesPlan.map((plan, index) => (
                  <div key={index} className="flex gap-2.5 items-start">
                    <span className="text-orange-500 font-semibold shrink-0">{index + 1}.</span>
                    <p>{plan}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 font-sans text-xs text-slate-400">
                No extra boundary tips for this message.
              </div>
            )}
          </div>

        </div>

      </motion.div>

      {/* 3. QUOTED EVIDENCE ELEMENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        className="space-y-6"
        id="results_secondary_details"
      >
         
        {/* Quoted evidence from message */}
        <div className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-4`} id="card_evidence_from_message">
          <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Quoted evidence
            </h3>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed italic ${
            theme === "dark" ? "bg-slate-950/80 border-slate-805" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="text-slate-705 dark:text-slate-300 font-sans not-italic">
              "{result.messageText || "No message text available."}"
            </div>
          </div>
        </div>

        {/* Triple parameters summary columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pressure patterns */}
          <div className={`p-5 rounded-2xl ${bgCardClass} space-y-4`} id="card_hidden_pressure_signals">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-2.5 font-sans">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Pressure patterns
              </h3>
            </div>

            {result.stylisticSubtextIndicators && result.stylisticSubtextIndicators.length > 0 ? (
              <div className="space-y-3.5">
                {result.stylisticSubtextIndicators.map((sub, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="font-semibold text-xs text-orange-500 font-sans block">
                      {sub.hint}
                    </span>
                    <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
                      {sub.whyItMatters}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans italic">No clear pressure pattern detected.</p>
            )}
          </div>

          {/* What to check next */}
          <div className={`p-5 rounded-2xl ${bgCardClass} space-y-4`} id="card_what_to_check_next">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-2.5 font-sans">
              <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                What to verify
              </h3>
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-350 font-sans">
              {result.diligenceSafeguardsRecommended || "Review prior written milestones first. Avoid verbal confirmations that are not mapped safely to written items."}
            </p>
          </div>

          {/* Things to keep in mind */}
          <div className={`p-5 rounded-2xl ${bgCardClass} space-y-4`} id="card_things_to_keep_mind">
            <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-2.5 font-sans">
              <Bookmark className="w-4 h-4 text-orange-500 shrink-0" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Nuance
              </h3>
            </div>

            {result.uncertaintiesAndNuances && result.uncertaintiesAndNuances.length > 0 ? (
              <div className="space-y-2.5 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
                {result.uncertaintiesAndNuances.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start font-sans">
                    <span className="text-orange-550 shrink-0 font-bold">•</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans italic">No major nuance noted.</p>
            )}
          </div>

        </div>

      </motion.div>

      {/* 4. CONVERSATION FACTORS DETAIL BAR CHART */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
        className={`p-6 sm:p-7 rounded-2xl ${bgCardClass} space-y-6 text-left`}
        id="results_charts_panel"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-sans">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Conversation factors
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              A simple view of the strongest factors behind this result.
            </p>
          </div>
        </div>

        {/* Factors breakdown */}
        <div className="bg-slate-50 dark:bg-slate-950/20 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {(Object.keys(result.microFeatures) as Array<keyof MicroFeatures>).map((key) => {
              const val = result.microFeatures[key];
              const maxVal = result.microFeatureMaxes[key] || 10;
              const percentage = Math.min((val / maxVal) * 100, 100);
              const label = formatFeatureLabel(key);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-sans">
                    <span className="text-slate-600 dark:text-slate-350 font-medium">{label}</span>
                    <span className="text-slate-400 font-semibold shrink-0">
                      {val} <span className="opacity-50 text-[9px]">/ {maxVal}</span>
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-250 dark:bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${
                        percentage > 70 
                          ? "bg-rose-555" 
                          : percentage > 45 
                          ? "bg-amber-500" 
                          : "bg-orange-500"
                      }`}
                      style={{ backgroundColor: percentage > 70 ? "#ef4444" : percentage > 45 ? "#f59e0b" : "#f97316" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 5. SUMMARY ACTION BAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
        className={`p-6 sm:p-7 rounded-2xl text-center space-y-4 ${bgCardClass}`}
        id="card_reply_options"
      >
        <div className="space-y-1" id="reply_options_section font-sans">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Actions
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Copy the result or run another analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onCopyAllResults}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs cursor-pointer transition-all border shrink-0 flex items-center justify-center gap-1.5 bg-transparent duration-150 transform active:scale-98 ${
              isAllCopied 
                ? "border-emerald-500/20 text-emerald-500" 
                : theme === "dark" 
                ? "border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850" 
                : "border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50"
            }`}
          >
            {isAllCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isAllCopied ? "Copied" : "Copy full result"}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs cursor-pointer transition-all border shrink-0 flex items-center justify-center gap-1.5 bg-transparent duration-150 transform active:scale-98 ${
              theme === "dark" 
                ? "border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850" 
                : "border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-orange-500" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onScanAnother}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-sans font-semibold text-xs rounded-lg cursor-pointer transition-all duration-150 transform active:scale-98 hover:scale-[1.01] shadow-sm flex items-center justify-center gap-1.5 border-none"
          >
            <span>Analyze another message</span>
          </button>
        </div>
      </motion.div>

    </div>
  );
}
