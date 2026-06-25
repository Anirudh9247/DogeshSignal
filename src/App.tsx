import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FloatingSystemParticles } from "./components/BrandSystem";

// Shared Types
import { AnalysisResult, SystemNotification } from "./types";

// Modular Screens
import { Navbar } from "./components/Navbar";
import { LandingScreen } from "./components/LandingScreen";
import { ScanScreen } from "./components/ScanScreen";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { HistoryScreen } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";

// Preset database templates
const SAMPLES = [
  {
    title: "Contractor Scope Creep Trap",
    context: "Freelance Client / Project Owner",
    text: "Hey, before we finalize these payments, I've added a few more adjustments to the workspace. Please finish these additional items today. We have come this far, and I'm counting on you to help us cross this line.",
    rawType: "Freelance Client"
  },
  {
    title: "Hiring Bait & Unpaid Trials",
    context: "HR / Recruiter / Hiring Team",
    text: "We are hiring for this key role immediately and need a dependable self-starter today. If you can help us with this preliminary unpaid diagnostic challenge first, it will influence future opportunities positively.",
    rawType: "HR / Recruiter"
  },
  {
    title: "Apartment Rental Rush",
    context: "Landlord / Property Manager / Tenant",
    text: "I need you to show flexibility on this leasing rule. Finish the repairs today and we'll sort out payments later since I'm trusting you completely. I need to secure this listing by tonight.",
    rawType: "Landlord"
  },
  {
    title: "Marketplace Ambiguous Commitment",
    context: "Buyer / Seller / Marketplace Lead",
    text: "I have invested a lot of time waiting for this listing. Before we finalize anything, I need some pieces of the puzzle solved right now as I need someone I can trust. Let's finish up.",
    rawType: "Buyer / Seller"
  }
];

const DEFAULT_HISTORY_ITEMS: AnalysisResult[] = [
  {
    id: "hist-1",
    heuristicRiskRating: 75,
    transparencyProbability: 28,
    calculationConfidence: "HIGH",
    contextDetected: "Freelance Client / Project Owner",
    strategicScanTarget: "Worker / Freelancer / Vendor",
    messageText: "Hey, before we finalize these payments, I've added a few more adjustments to the workspace. Please finish these additional items today. We have come this far, and I'm counting on you to help us cross this line.",
    executiveSummary: "The sender is asserting severe project pressure by bundling scope expansions with deferred compensation terms. Sunk-cost tactics are implemented directly alongside trust-leverage phrases to hasten delivery with low accountability.",
    microFeatures: {
      deferredPaymentRisk: 22,
      urgencyPressure: 18,
      guiltPressure: 11,
      sunkCostPressure: 12,
      futureOpportunityBait: 4,
      scopeCreepRisk: 14,
      dependencyPressure: 9,
      boundaryErosion: 12,
      manipulationIntensity: 8,
      transparencySignals: 2
    },
    microFeatureMaxes: {
      deferredPaymentRisk: 25,
      urgencyPressure: 20,
      guiltPressure: 15,
      sunkCostPressure: 15,
      futureOpportunityBait: 10,
      scopeCreepRisk: 15,
      dependencyPressure: 10,
      boundaryErosion: 15,
      manipulationIntensity: 10,
      transparencySignals: 10
    },
    significantTonalAnomalies: [
      {
        category: "Deferred Compensation Pressure",
        severity: "HIGH",
        rationale: "Stated payment finalization is conditional on immediate performance of unrelated additional items.",
        evidenceSnippet: "before we finalize these payments"
      },
      {
        category: "Scope Creep Without Payment Terms",
        severity: "HIGH",
        rationale: "Inserted sudden work items without proposing timeline extensions or budget increments.",
        evidenceSnippet: "I've added a few more adjustments to the workspace"
      },
      {
        category: "Sunk-Cost Leverage",
        severity: "MEDIUM",
        rationale: "Used prior efforts or shared journey as an emotional leverage point to force unpaid compliance.",
        evidenceSnippet: "We have come this far"
      }
    ],
    stylisticSubtextIndicators: [
      { hint: "Dependency Leverage", whyItMatters: "Using language like 'counting on you' to emotionally obligate the contractor" }
    ],
    suggestedBoundariesPlan: [
      "Explicitly separate pre-existing invoices from new scope additions.",
      "Reply with formal timeline constraints and demand payment release before starting dashboard updates.",
      "Propose standard change order pricing."
    ],
    diligenceSafeguardsRecommended: "Implement structured milestones; secure full payment on the previous task.",
    uncertaintiesAndNuances: ["Could represent simple communication ignorance rather than malicious exploitation"],
    replyForgeStatus: "Active",
    replies: {
      professional: "Thank you for the updates on the dashboard. I request that we release the current pending payments for completed work before outlining a separate contract and estimate for these new additions. Let me know when the payment goes through so we can plan the kick-off.",
      bold: "I see you have added changes. We need to clear and resolve the previous invoice payments first to ensure our contract is in good standing. Once completed, I will look forward to providing a new estimate and deposit terms for these additional modifications.",
      supportive: "I completely understand the excitement to finalize the current stretch. To make this seamless, let's process the pending invoices today. I'm happy to dive directly into these dashboard additions right after the initial invoice is settled."
    },
    timestamp: "2026-06-15 01:12"
  },
  {
    id: "hist-2",
    heuristicRiskRating: 52,
    transparencyProbability: 58,
    calculationConfidence: "LOW",
    contextDetected: "HR / Recruiter / Hiring Team",
    strategicScanTarget: "Job Candidate",
    messageText: "We are hiring for this key role immediately and need a dependable self-starter today. If you can help us with this preliminary unpaid diagnostic challenge first, it will influence future opportunities positively.",
    executiveSummary: "The message relies on non-monetary futuristic career bait combined with urgent tactical pressure to secure uncompensated intellectual material. Real employment guidelines are missing.",
    microFeatures: {
      deferredPaymentRisk: 2,
      urgencyPressure: 12,
      guiltPressure: 3,
      sunkCostPressure: 1,
      futureOpportunityBait: 10,
      scopeCreepRisk: 5,
      dependencyPressure: 7,
      boundaryErosion: 4,
      manipulationIntensity: 5,
      transparencySignals: 5
    },
    microFeatureMaxes: {
      deferredPaymentRisk: 5,
      urgencyPressure: 15,
      guiltPressure: 12,
      sunkCostPressure: 10,
      futureOpportunityBait: 12,
      scopeCreepRisk: 8,
      dependencyPressure: 12,
      boundaryErosion: 12,
      manipulationIntensity: 15,
      transparencySignals: 10
    },
    significantTonalAnomalies: [
      {
        category: "Future-Opportunity Framing",
        severity: "MEDIUM",
        rationale: "Fuzzy promises of future preference to avoid compensating immediate candidate labor.",
        evidenceSnippet: "influence future opportunities positively"
      }
    ],
    stylisticSubtextIndicators: [
      { hint: "Recruiting leverage", whyItMatters: "Exploiting candidate market pressures with accelerated timetables." }
    ],
    suggestedBoundariesPlan: [
      "Inquire if candidate tests are standard across all developers and request a nominal stipend.",
      "Request details about standard contract parameters, base rate, and timeline."
    ],
    diligenceSafeguardsRecommended: "Establish written parameters on intellectual property ownership for test artifacts.",
    uncertaintiesAndNuances: ["Could simply be an eager hiring manager using outdated standard templates"],
    replyForgeStatus: "Active",
    replies: {
      professional: "Thank you for the opportunity. I would be glad to participate in the selection process. Could we first document the scope, expectations, and compensation package for this role in writing so we are aligned on basic parameters?",
      bold: "I am highly interested in the role. However, for initial candidate checks, I do not take on unpaid trials. I would be happy to discuss a short compensated pilot project or proceed with standard interviews.",
      supportive: "I am eager to support your immediate needs. To ensure we set things up for long-term alignment, can you share the formal job description and standard billing rates or annual salary package?"
    },
    timestamp: "2026-06-15 03:01"
  }
];

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md");

  const handleTabChange = (tabId: string) => {
    if (tabId === "how-it-works") {
      setActiveTab("landing");
      setTimeout(() => {
        const el = document.getElementById("how_it_works_section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 120);
    } else {
      setActiveTab(tabId);
    }
  };

  // Input states
  const [messageText, setMessageText] = useState("");
  const [selectedContext, setSelectedContext] = useState("All Contexts");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDogLog, setActiveDogLog] = useState("Ready to analyze a message.");
  const [error, setError] = useState<string | null>(null);

  // Loaded result state
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("ALL");
  const [isAllCopied, setIsAllCopied] = useState(false);

  // Notification Queue
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "notif-1",
      category: "Tone Analysis",
      title: "Urgent pressure pattern flagged",
      description: "Linguistic risk score: 75/100. Sunk-cost and scope additions identified without clear milestones.",
      time: "2 mins ago",
      severity: "HIGH",
      isRead: false
    },
    {
      id: "notif-2",
      category: "Clarity Guide",
      title: "Recruiting indicators updated",
      description: "Refined indicators to better identify vague future opportunity claims.",
      time: "1 hour ago",
      severity: "LOW",
      isRead: false
    },
    {
      id: "notif-3",
      category: "Information",
      title: "On-device storage active",
      description: "Your safe settings and history save directly and privately inside your browser cache.",
      time: "5 hours ago",
      severity: "LOW",
      isRead: true
    }
  ]);

  const loadingMessages = [
    "Checking message text...",
    "Looking for high-pressure requests & sudden urgencies...",
    "Highlighting emotional triggers & missing boundaries...",
    "Checking details on timelines & commitments...",
    "Drafting respectful & firm boundary replies..."
  ];

  // Load preferences and history cache on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("dogesh_premium_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme as "light" | "dark");
    } else {
      setTheme("dark");
    }

    const savedHistory = localStorage.getItem("dogesh_premium_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        setHistory(DEFAULT_HISTORY_ITEMS);
      }
    } else {
      setHistory(DEFAULT_HISTORY_ITEMS);
      localStorage.setItem("dogesh_premium_history", JSON.stringify(DEFAULT_HISTORY_ITEMS));
    }
  }, []);

  // Sync theme class to document element for Tailwind dark variants
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Sync latest history element to Result as initial view if present
  useEffect(() => {
    if (history.length > 0 && !result && !isAnalyzing) {
      setResult(history[0]);
    }
  }, [history]);

  // Adjust application CSS classes according to text sizes
  const textSizeClass = textSize === "sm" 
    ? "text-xs select-none" 
    : textSize === "lg" 
    ? "text-base select-none" 
    : "text-sm select-none";

  const bgThemeClass = theme === "dark" 
    ? "bg-slate-950 text-slate-100" 
    : "bg-slate-50 text-slate-800";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("dogesh_premium_theme", nextTheme);
  };

  const handleLaunchScanPage = () => {
    setResult(null);
    setMessageText("");
    setActiveTab("workspace");
  };

  const handleLaunchExampleScan = (textToScan: string) => {
    setResult(null);
    setMessageText(textToScan);
    setActiveTab("workspace");
    handleTriggerScan(textToScan);
  };

  const handleTriggerScan = async (forcedText?: string) => {
    const finalText = (forcedText || messageText).trim();
    if (!finalText) {
      setError("Please paste a message or thread to start scanning.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setActiveDogLog(loadingMessages[0]);

    // Simple loading animation interval simulation
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalText, enableReplyForge: true }),
      });

      if (!response.ok) {
        throw new Error(`Analyze API failed with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();

      const completeResult: AnalysisResult = {
        ...data,
        id: "scan-" + Date.now(),
        timestamp: new Date().toLocaleDateString(undefined, { 
          month: "short", 
          day: "numeric", 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        messageText: finalText
      };

      // Persistence
      const refreshedHistory = [completeResult, ...history.filter(h => h.messageText !== finalText)];
      setHistory(refreshedHistory);
      localStorage.setItem("dogesh_premium_history", JSON.stringify(refreshedHistory));

      // Notification entry trigger
      const hasHighPressure = data.heuristicRiskRating > 50;
      const notif: SystemNotification = {
         id: "notif-vetted-" + Date.now(),
         category: "Analysis Complete",
         title: hasHighPressure ? "High pressure flagged" : "Clear tone verified",
         description: `Message analyzed: Risk score is ${data.heuristicRiskRating}%.`,
         time: "Just now",
         severity: hasHighPressure ? "HIGH" : "LOW",
         isRead: false
      };
      setNotifications(prev => [notif, ...prev]);

      setResult(completeResult);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "There was a routing problem with the AI vetting api. Please try again.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleOpenHistoricalScanResult = (scan: AnalysisResult) => {
    setResult(scan);
    setMessageText(scan.messageText || "");
    setActiveTab("workspace");
  };

  const handleCopyFullReportToClipboard = () => {
    if (!result) return;
    const summaryText = `[Dogesh Signal Report]\nScenario Context: ${result.contextDetected}\nRisk Rating: ${result.heuristicRiskRating}/100\nConfidence: ${result.calculationConfidence}\n\nExecutive Summary: ${result.executiveSummary}\n\nSuggested counterdraft (Professional): ${result.replies?.professional || "N/A"}`;
    navigator.clipboard.writeText(summaryText);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);

    const checkNotif: SystemNotification = {
      id: "notif-summary-copied-" + Date.now(),
      category: "Secure Copy",
      title: "Full report successfully copied to memory",
      description: "You can now share this consolidated summary safety file.",
      time: "Just now",
      severity: "LOW",
      isRead: false
    };
    setNotifications(prev => [checkNotif, ...prev]);
  };

  const handleDeleteHistoryTrace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const refreshed = history.filter(h => h.id !== id);
    setHistory(refreshed);
    localStorage.setItem("dogesh_premium_history", JSON.stringify(refreshed));
    if (result?.id === id) {
      setResult(refreshed[0] || null);
    }
  };

  const handlePurgeAllLocalCaches = () => {
    if (window.confirm("Purge your entire local storage trace database immediate? This is irreversible.")) {
      setHistory([]);
      localStorage.removeItem("dogesh_premium_history");
      setResult(null);
      setMessageText("");
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifChannels = () => {
    setNotifications([]);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`} id="dogesh_root_optimized">
      
      {/* Decorative ambient gradients for high-end SaaS feel */}
      {theme === "dark" && (
        <>
          <FloatingSystemParticles />
          <div className="absolute top-[-5%] right-[-10%] w-[38%] h-[35%] bg-orange-950/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-950/25 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* FIXED PREMIUM TOP NAVIGATION BAR */}
      <Navbar
        theme={theme === "system" ? "dark" : theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        notifications={notifications}
        markAllRead={handleMarkAllRead}
        dismissNotif={handleDismissNotification}
        clearAllNotifs={handleClearAllNotifChannels}
        onScanCTA={handleLaunchScanPage}
        isAlreadyOnScanScreen={activeTab === "workspace" && !result}
      />

      {/* ACTIVE PAGE CONTENT HUB */}
      <main className={`flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 space-y-12 ${textSizeClass}`}>
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PRODUCT DETAILS PORTAL */}
          {activeTab === "landing" && (
            <motion.div
              key="landing_panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LandingScreen
                theme={theme === "system" ? "dark" : theme}
                onLaunchScan={handleLaunchScanPage}
                onLaunchExample={handleLaunchExampleScan}
              />
            </motion.div>
          )}

          {/* TAB 2: ACTIVE DIGITAL WORKSPACE */}
          {activeTab === "workspace" && (
            <motion.div
              key="workspace_panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {result ? (
                // IF WE HAVE SCANNED AN ITEM, DISPLAY THE NEW COMPREHENSIVE CARD REPORT
                <ResultsDashboard
                  theme={theme === "system" ? "dark" : theme}
                  result={result}
                  onScanAnother={handleLaunchScanPage}
                  onCopyAllResults={handleCopyFullReportToClipboard}
                  isAllCopied={isAllCopied}
                />
              ) : (
                // ELSE PROMPT WORKSPACE WITH ENTER PROMPT BOX
                <ScanScreen
                  theme={theme === "system" ? "dark" : theme}
                  messageText={messageText}
                  setMessageText={setMessageText}
                  selectedContext={selectedContext}
                  setSelectedContext={setSelectedContext}
                  isAnalyzing={isAnalyzing}
                  activeDogLog={activeDogLog}
                  error={error}
                  samples={SAMPLES}
                  onTriggerScan={() => handleTriggerScan()}
                  onSelectSample={handleLaunchExampleScan}
                />
              )}
            </motion.div>
          )}

          {/* TAB 3: SCAN LOG HISTORY */}
          {activeTab === "history" && (
            <motion.div
              key="history_panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <HistoryScreen
                theme={theme === "system" ? "dark" : theme}
                history={history}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                historyFilter={historyFilter}
                setHistoryFilter={setHistoryFilter}
                onOpenScan={handleOpenHistoricalScanResult}
                onDeleteScan={handleDeleteHistoryTrace}
                onClearAll={handlePurgeAllLocalCaches}
              />
            </motion.div>
          )}

          {/* TAB 4: SYSTEM NOTIFICATIONS SCREEN */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications_panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <NotificationsScreen
                theme={theme === "system" ? "dark" : theme}
                notifications={notifications}
                markAllRead={handleMarkAllRead}
                dismissNotif={handleDismissNotification}
                clearAllNotifs={handleClearAllNotifChannels}
              />
            </motion.div>
          )}

          {/* TAB 5: PREFERENCES & SECURITY SPECS */}
          {activeTab === "settings" && (
            <motion.div
              key="settings_panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SettingsScreen
                theme={theme === "system" ? "dark" : theme}
                toggleTheme={toggleTheme}
                textSize={textSize}
                setTextSize={setTextSize}
                onClearHistory={handlePurgeAllLocalCaches}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* SIMPLE COMPRESSED BRAND FOOTER */}
      <footer className="py-8 border-t border-slate-100 dark:border-slate-900 text-center font-mono text-[10px] text-slate-400 dark:text-slate-500 max-w-7xl mx-auto w-full px-4">
        <p>© 2026 Dogesh Signal Security. Protected by client-side browser trace mechanics.</p>
        <p className="mt-1">Plain, transparent advice to hold your boundaries. Never react in fear.</p>
      </footer>

    </div>
  );
}
