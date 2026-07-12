import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { validateEnvironment } from "./src/server/middleware/validateEnv.middleware";
import { logEvent } from "./src/server/utils/logger";

// Validate required configurations on boot
validateEnvironment();

const app = express();

// Custom parser to capture rawBody for webhook signature verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Import and mount routers
import analysisRouter from "./src/server/routes/analysis.routes";
import paymentRouter from "./src/server/routes/payment.routes";
import webhookRouter from "./src/server/routes/webhook.routes";
import healthRouter from "./src/server/routes/health.routes";
import entitlementsRouter from "./src/server/routes/entitlements.routes";

app.use("/api", analysisRouter);
app.use("/api", paymentRouter);
app.use("/api", webhookRouter);
app.use("/api", healthRouter);
app.use("/api", entitlementsRouter);

// App server startup
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

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

  app.listen(PORT, "localhost", () => {
    logEvent("INFO", `[Dogesh Signal DB Node] Server running on http://localhost:${PORT}`);
  });
}

startServer();
