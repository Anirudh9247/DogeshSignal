import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import { validateEnvironment } from "./src/server/middleware/validateEnv.middleware";
import { logEvent } from "./src/server/utils/logger";
import { supabaseAdmin, isSupabaseConfiguredBackend } from "./src/server/utils/supabase";

// Validate required configurations on boot
validateEnvironment();

const app = express();

// ── Block sensitive config and dotfile access ────────────────────────────────
app.use((req, res, next) => {
  const urlPath = req.path.toLowerCase();
  if (
    urlPath.includes("/.env") ||
    urlPath.includes("/package.json") ||
    urlPath.includes("/tsconfig.json") ||
    urlPath.includes("/supabase_schema.sql") ||
    urlPath.split("/").some(part => part.startsWith(".") && part !== "" && part !== ".well-known")
  ) {
    logEvent("WARN", `Blocked access attempt to sensitive file: ${req.originalUrl}`, { ip: req.ip });
    return res.status(403).json({ error: "Access denied. Sensitive file exposure is blocked." });
  }
  next();
});

// ── Security headers (helmet sets X-Frame-Options, CSP, HSTS, etc.) ──────────
app.use(helmet({
  // Allow Razorpay checkout.js and our own scripts
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "https://checkout.razorpay.com", "'unsafe-inline'"],
      frameSrc:    ["'self'", "https://api.razorpay.com"],
      connectSrc:  ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      imgSrc:      ["'self'", "data:", "https://checkout.razorpay.com"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      fontSrc:     ["'self'", "data:"],
      workerSrc:   ["'self'", "blob:"]
    }
  }
}));

// ── CORS — only allow requests from our own origin in production ──────────────
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
  : [];
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",   // Vite dev server
  "https://dogeshsignal.netlify.app", // Production frontend
  ...envOrigins
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ── Response compression ──────────────────────────────────────────────────────
app.use(compression());

// ── Body parser — captures rawBody for webhook HMAC verification ──────────────
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// ── API Routers ───────────────────────────────────────────────────────────────
import analysisRouter    from "./src/server/routes/analysis.routes";
import paymentRouter     from "./src/server/routes/payment.routes";
import webhookRouter     from "./src/server/routes/webhook.routes";
import healthRouter      from "./src/server/routes/health.routes";
import entitlementsRouter from "./src/server/routes/entitlements.routes";

app.use("/api", analysisRouter);
app.use("/api", paymentRouter);
app.use("/api", webhookRouter);
app.use("/api", healthRouter);
app.use("/api", entitlementsRouter);

// Root health check endpoint for Render/hosting health checks
app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// Internal admin/deployment readiness probe to verify DB connection & tables
app.get("/api/internal/readiness", async (req, res) => {
  const token = req.query.token || req.headers["x-readiness-token"];
  const expectedToken = process.env.READINESS_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized readiness check" });
  }

  try {
    const targetTables = ["profiles", "analysis_history", "usage", "credit_packs", "credit_transactions", "payments"];
    const results: Record<string, boolean> = {};

    if (isSupabaseConfiguredBackend()) {
      for (const t of targetTables) {
        const { error } = await supabaseAdmin.from(t).select("id").limit(1);
        results[t] = !error || error.code === "PGRST116";
      }
    } else {
      for (const t of targetTables) {
        results[t] = true;
      }
    }

    const allHealthy = Object.values(results).every(v => v);
    return res.status(allHealthy ? 200 : 500).json({
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: results
    });
  } catch (err: any) {
    return res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

// ── Server startup ────────────────────────────────────────────────────────────
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logEvent("INFO", `[Dogesh Signal] Server running on http://localhost:${PORT}`);
  });
}

startServer();
