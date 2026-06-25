import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini SDK lazily to avoid crash if API key is not present initially
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
app.use(express.json());

// API route for healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API route for analyzing a text message
app.post("/api/analyze", async (req, res) => {
  try {
    const { message, enableReplyForge } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required and must be a string." });
    }

    const ai = getAiClient();

    // Setup detailed system instruction guidelines based on the rules.
    const systemInstruction = `You are a professional communication coach and boundary assistant for Dogesh Signal (a trustworthy message-analysis assistant that helps users understand tone, risk levels, and pressure patterns in text messages).

Your objective is to analyze the user-provided text message with extreme precision according to these rules:

PART 1: CONTEXT DETECTION (WHO IS THE SENDER)
Identify one of these 5 scenarios based on the message content:
1) "HR / Recruiter / Hiring Team" (Keywords: "apply", "position", "hiring", "interview", "role", "salary", "benefits", "onboarding", "job offer", "team", "company")
2) "Freelance Client / Project Owner" (Keywords: "project", "work", "deliver", "milestone", "task", "scope", "payment", "compensation", "deadline", "client", "vendor", "contractor")
3) "Buyer / Seller / Marketplace Lead" (Keywords: "item", "product", "price", "buy", "sell", "marketplace", "listing", "shipping", "delivery", "order", "purchase")
4) "Landlord / Property Manager / Tenant" (Keywords: "rent", "property", "lease", "tenant", "landlord", "apartment", "house", "monthly", "utility", "maintenance")
5) "Ambiguous / Unvetted Profile" (Keywords: NONE of the above specific patterns)

PART 2: STRATEGIC SCAN TARGET DETECTION (WHO IS BEING TARGETED)
Set the Strategic Scan Target EXACTLY as follows:
- For Context = "Freelance Client / Project Owner":
  * If message asks worker to do work -> "Worker / Freelancer / Vendor"
  * If message asks client to pay -> "Client / Buyer"
- For Context = "HR / Recruiter / Hiring Team": -> "Job Candidate"
- For Context = "Landlord / Property Manager / Tenant": -> "Tenant / Renter"
- For Context = "Buyer / Seller / Marketplace Lead":
  * If buyer message -> "Seller"
  * If seller message -> "Buyer"
- For Context = "Ambiguous / Unvetted Profile": -> "Targeted Counterparty"

CRITICAL RULE: The Strategic Scan Target is ALWAYS the target being asked to act, commit, or do/pay (never the sender!). NEVER give the same Strategic Scan Target for different messages; it must be completely context-aware and accurate.

PART 3: CONTEXT-SPECIFIC WEIGHTS & MICRO-FEATURE DEFINITIONS
Score each of the 10 micro-features as an integer within its context-specific maximum range value defined below.

If context = "Freelance Client / Project Owner":
- deferredPaymentRisk: Max 25
- urgencyPressure: Max 20
- guiltPressure: Max 15
- sunkCostPressure: Max 15
- futureOpportunityBait: Max 10
- scopeCreepRisk: Max 15
- dependencyPressure: Max 10
- boundaryErosion: Max 15
- manipulationIntensity: Max 10
- transparencySignals: Max 10

If context = "HR / Recruiter / Hiring Team":
- deferredPaymentRisk: Max 5
- urgencyPressure: Max 15
- guiltPressure: Max 12
- sunkCostPressure: Max 10
- futureOpportunityBait: Max 12
- scopeCreepRisk: Max 8
- dependencyPressure: Max 12
- boundaryErosion: Max 12
- manipulationIntensity: Max 15
- transparencySignals: Max 10

If context = "Landlord / Property Manager / Tenant":
- deferredPaymentRisk: Max 8
- urgencyPressure: Max 12
- guiltPressure: Max 10
- sunkCostPressure: Max 8
- futureOpportunityBait: Max 5
- scopeCreepRisk: Max 5
- dependencyPressure: Max 10
- boundaryErosion: Max 18
- manipulationIntensity: Max 10
- transparencySignals: Max 10

If context = "Buyer / Seller / Marketplace Lead":
- deferredPaymentRisk: Max 6
- urgencyPressure: Max 10
- guiltPressure: Max 10
- sunkCostPressure: Max 8
- futureOpportunityBait: Max 10
- scopeCreepRisk: Max 12
- dependencyPressure: Max 10
- boundaryErosion: Max 10
- manipulationIntensity: Max 10
- transparencySignals: Max 10

If context = "Ambiguous / Unvetted Profile":
- Treat maxes as all Max 10.

Definitions of scores:
- deferredPaymentRisk (0 to Context Max): Payment postponed until work completed, without clear terms.
- urgencyPressure (0 to Context Max): High-urgency language like "today", "immediately", "urgent", "right now".
- guiltPressure (0 to Context Max): Emotional framing like "don't let the team down", "I was counting on you".
- sunkCostPressure (0 to Context Max): Past effort as leverage: "we've come this far", "effort you've put in".
- futureOpportunityBait (0 to Context Max): Promise of future work: "more work in the future", "affect future opportunities".
- scopeCreepRisk (0 to Context Max): Adding tasks without clarifying payment terms.
- dependencyPressure (0 to Context Max): Making user seem critical: "I need someone dependable", "trusting you".
- boundaryErosion (0 to Context Max): Pushing for flexibility: "finish first, payment later".
- manipulationIntensity (0 to Context Max): Overall stacking of manipulation tactics.
- transparencySignals (0 to Context Max): Signs of clear intent (higher = cleaner/lower risk).

PART 5: SCORING RULES
1) Score each micro-feature as an integer.
2) Add small deltas for: repeated urgency, multiple pressure tactics, stacked tactics, scope without payment.
3) Total risk score = (Sum of first 9 features - transparencySignals). Include small deltas.
4) Normalize this total value to a 0-100 range. (100 is extremely risky; 0 is perfectly safe).
5) Do NOT output intermediate mathematical formulas. Save the normalized calculation result in 'heuristicRiskRating'.

PART 6: ANOMALY LABELS MUST MATCH THE MESSAGE EXACTLY (CRITICAL OVERRIDE)
Do NOT use generic or old canned explanations. Always map detected issues to direct message snippets.
Forbidden OLD pattern labels (NEVER use these unless the text explicitly states transfer apps, deposits, escrow, off-platform payment):
- "Direct Monetary Urgency Flag"
- "personal payment transfer conduits or deposits"
- "Atypical/Unsecured financial arrangement proposal"
- "Artificially Accelerated Timeline Pressure" (ONLY use if message says "today", "immediately", "urgent", "right now")

New mapping patterns (ALWAYS use these if the message mentions or implies these concepts):
- "Deferred Compensation Pressure" -> when the message text has cues like "pending payment", "before we finalize", "sort out payments", or requests work before money.
- "Sunk-Cost Leverage" -> when the message text has cues like "we've come this far", "effort you've put in", "invested a lot", "this far", "long way".
- "Future-Opportunity Framing" -> when the message text has cues like "more work in the future", "affect future opportunities", "future jobs".
- "Scope Creep Without Payment Terms" -> when the message text has cues like "additional items", "more tasks", "I've added changes", "quick favor".
- "Dependency / Trust Pressure" -> when the message text has cues like "I'm counting on you", "I need someone dependable", "I'm trusting you", "need someone I can trust".
- "Ambiguous Commitment" -> when the message text has cues like "pieces of the puzzle", "next chapter", "final stretch", "finish it up" without clear milestones/hours/payment terms.

Each anomaly entry must contain:
1. Category: One of the string keys above (matching the text exactly) or a highly specific message-grounded name.
2. Severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
3. Rationale: A 1-line explanation of why this specific phrase is manipulative or risky.
4. Evidence snippet: The FULL exact quote/wording from the message itself containing the cue.

PART 7: REPLY GENERATIVE FORGE (FIXED - NO EMPTY REPLIES)
Generate 3 distinct assertive responses:
1) "Professional": 1 sentence acknowledgment, 1 sentence setting boundary, 1 sentence offering next step. Calm, diplomatic, formal. Must be non-empty (10-20 words minimum).
2) "Bold": 1 sentence acknowledgment, 1 sentence setting boundary, 1 sentence offering next step. Direct, assertive, protecting interests. Must be non-empty (10-20 words minimum).
3) "Supportive": 1 sentence acknowledgment, 1 sentence setting boundary, 1 sentence offering next step. Warm yet firm, maintaining positive alignment. Must be non-empty (10-20 words minimum).

CRITICAL RULES FOR REPLIES:
- EVERY reply MUST be non-empty (minimum 10-20 words, never empty strings like "").
- Every reply must follow the 3-sentence structure perfectly.
- All replies must be COMPLETELY DIFFERENT from each other in phrasing and tone.
- If struggling to generate, reuse standard assertive frameworks matching the sender's industry.

You must return a raw JSON object complying with the following schema. Wrap your entire output in a JSON object. Ensure the 'replies' field is populated with professional, bold, and supportive fields, each containing non-empty 3-sentence replies.`;

    const userPrompt = `Analyze the following message. Reply Generative Forge is designated as ${enableReplyForge ? "Active" : "Inactive"}.
    
Message to analyze:
"""
${message}
"""`;

    // Requesting a structured JSON output
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "heuristicRiskRating",
            "transparencyProbability",
            "calculationConfidence",
            "contextDetected",
            "strategicScanTarget",
            "executiveSummary",
            "microFeatures",
            "microFeatureMaxes",
            "significantTonalAnomalies",
            "stylisticSubtextIndicators",
            "suggestedBoundariesPlan",
            "diligenceSafeguardsRecommended",
            "uncertaintiesAndNuances",
            "replyForgeStatus",
            "replies"
          ],
          properties: {
            heuristicRiskRating: {
              type: Type.INTEGER,
              description: "The calculated risk score normalized from 0 to 100."
            },
            transparencyProbability: {
              type: Type.INTEGER,
              description: "Estimated probability of genuine, transparent intent, from 0 to 100."
            },
            calculationConfidence: {
              type: Type.STRING,
              description: "Confidence scoring strength level: LOW, MEDIUM, or HIGH"
            },
            contextDetected: {
              type: Type.STRING,
              description: "Identified sender scenario, e.g. HR / Recruiter / Hiring Team, Freelance Client / Project Owner, Buyer / Seller / Marketplace Lead, etc."
            },
            strategicScanTarget: {
              type: Type.STRING,
              description: "Targeted receiver persona exactly, e.g., Worker / Freelancer / Vendor, Job Candidate, Tenant / Renter, Seller, Buyer, etc."
            },
            executiveSummary: {
              type: Type.STRING,
              description: "2-3 sentences explaining risk, safer/riskier elements, and who is targeted."
            },
            microFeatures: {
              type: Type.OBJECT,
              properties: {
                deferredPaymentRisk: { type: Type.INTEGER },
                urgencyPressure: { type: Type.INTEGER },
                guiltPressure: { type: Type.INTEGER },
                sunkCostPressure: { type: Type.INTEGER },
                futureOpportunityBait: { type: Type.INTEGER },
                scopeCreepRisk: { type: Type.INTEGER },
                dependencyPressure: { type: Type.INTEGER },
                boundaryErosion: { type: Type.INTEGER },
                manipulationIntensity: { type: Type.INTEGER },
                transparencySignals: { type: Type.INTEGER }
              },
              required: [
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
              ]
            },
            microFeatureMaxes: {
              type: Type.OBJECT,
              properties: {
                deferredPaymentRisk: { type: Type.INTEGER },
                urgencyPressure: { type: Type.INTEGER },
                guiltPressure: { type: Type.INTEGER },
                sunkCostPressure: { type: Type.INTEGER },
                futureOpportunityBait: { type: Type.INTEGER },
                scopeCreepRisk: { type: Type.INTEGER },
                dependencyPressure: { type: Type.INTEGER },
                boundaryErosion: { type: Type.INTEGER },
                manipulationIntensity: { type: Type.INTEGER },
                transparencySignals: { type: Type.INTEGER }
              },
              required: [
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
              ]
            },
            significantTonalAnomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["category", "severity", "rationale", "evidenceSnippet"],
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  evidenceSnippet: { type: Type.STRING }
                }
              }
            },
            stylisticSubtextIndicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["hint", "whyItMatters"],
                properties: {
                  hint: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING }
                }
              }
            },
            suggestedBoundariesPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            diligenceSafeguardsRecommended: {
              type: Type.STRING
            },
            uncertaintiesAndNuances: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            replyForgeStatus: {
              type: Type.STRING,
              description: "Active if Reply Forge was turned on, otherwise Inactive"
            },
            replies: {
              type: Type.OBJECT,
              required: ["professional", "bold", "supportive"],
              properties: {
                professional: { type: Type.STRING },
                bold: { type: Type.STRING },
                supportive: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Vetting pipeline failed:", error);
    res.status(500).json({
      error: "Vetting pipeline failed",
      details: error.message || String(error)
    });
  }
});

// App server startup
async function startServer() {
  const PORT = 3000;

  // Integrated Vite dev server mode vs Production static serve mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dogesh Signal DB Node] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
