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
import { AnalysisResult, MicroFeatures } from "../types";

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
  // Use sentence-case Tone matching direct and professional mapped to the original state
  const [activeReplyTone, setActiveReplyTone] = useState<"Professional" | "Direct">("Professional");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const textTitleClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const textMutedClass = theme === "dark" ? "text-slate-400" : "text-slate-500";
  
  const bgCardClass = theme === "dark"
    ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl transition-all duration-200"
    : "bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md";

  const handleCopyReplyText = (text: string, tone: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(tone);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Map sentence-case UI selections to types-safe backing fields
  const repliesMap = {
    Professional: result.replies?.professional,
    Direct: result.replies?.bold
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

            {/* Tone option tabs (Professional vs Direct sentence-case) */}
            <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 font-sans text-xs select-none flex">
              {(["Professional", "Direct"] as const).map((tone) => {
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

            {/* Render selected reply */}
            {repliesMap[activeReplyTone] && (
              <div className={`p-4 rounded-xl border space-y-4 relative ${
                theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
              }`}>
                <p className={`text-xs leading-relaxed italic ${theme === "dark" ? "text-slate-200 font-sans" : "text-slate-800 font-medium"}`}>
                  "{repliesMap[activeReplyTone]}"
                </p>

                <div className="flex items-center justify-end pt-3 border-t border-slate-150 dark:border-slate-900/60 font-sans">
                  <button
                    onClick={() => handleCopyReplyText(repliesMap[activeReplyTone] || "", activeReplyTone)}
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
            )}
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
