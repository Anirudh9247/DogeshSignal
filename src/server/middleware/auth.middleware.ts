import { Request, Response, NextFunction } from "express";
import { supabaseAdmin, isSupabaseConfiguredBackend } from "../utils/supabase";
import { logEvent } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: any;
  usageSource?: "plan" | "credit";
  targetPack?: any;
  currentUsageRow?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!isSupabaseConfiguredBackend()) {
      req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@example.com" };
      return next();
    }
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const getAuthUser = async () => {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) throw new Error(error?.message || "User not found");
      return user;
    };
    
    let user;
    let retries = 2;
    let delay = 500;
    while (true) {
      try {
        user = await getAuthUser();
        break;
      } catch (err) {
        if (retries <= 0) throw err;
        retries--;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }

    req.user = user;
    next();
  } catch (err: any) {
    logEvent("WARN", "Auth middleware authentication failed", { error: err.message });
    return res.status(401).json({ error: "Authentication failed", details: err.message });
  }
}
