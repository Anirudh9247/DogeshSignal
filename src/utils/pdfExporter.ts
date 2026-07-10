import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types/analysis";
import toast from "react-hot-toast";

export function exportAnalysisToPDF(result: AnalysisResult, exportSummaryAllowed: boolean) {
  if (!exportSummaryAllowed) {
    toast.error("Exporting PDF report is a premium feature. Please upgrade your plan in settings!");
    return;
  }
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
    doc.text("SIGNIFICANT EXPLOITATION SIGNALS DETECTED", margin, y);
    y += 6;
    
    for (const alert of result.significantTonalAnomalies) {
      const wrapRationale = doc.splitTextToSize(`• ${alert.category} (${alert.severity}): ${alert.rationale}`, contentWidth - 10);
      const wrapEvidence = doc.splitTextToSize(`  Evidence: "${alert.evidenceSnippet}"`, contentWidth - 15);
      
      const itemHeight = (wrapRationale.length * 5) + (wrapEvidence.length * 4.5) + 4;
      checkPageBreak(itemHeight);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(wrapRationale, margin, y);
      y += wrapRationale.length * 5;
      
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(wrapEvidence, margin + 5, y);
      y += (wrapEvidence.length * 4.5) + 4;
    }
    y += 6;
  }
  
  // Section: Suggested Boundaries Plan
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
}
