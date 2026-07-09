import { logEvent } from "../utils/logger";

export function validateEnvironment() {
  const isProd = process.env.NODE_ENV === "production";
  const requiredVars = [
    "GEMINI_API_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    const msg = `[STARTUP ERROR] Missing required environment variables: ${missing.join(", ")}`;
    if (isProd) {
      logEvent("ERROR", msg);
      process.exit(1);
    } else {
      logEvent("WARN", msg + " (Continuing in mock-fallback mode)");
    }
  }
}
