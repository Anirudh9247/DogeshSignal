import { Request, Response } from "express";
import { supabaseAdmin, isSupabaseConfiguredBackend } from "../utils/supabase";

export async function checkHealth(req: Request, res: Response) {
  let supabaseStatus = "down";
  let geminiStatus = process.env.GEMINI_API_KEY ? "up" : "down";
  let razorpayStatus = process.env.RAZORPAY_KEY_SECRET ? "up" : "down";
  
  if (isSupabaseConfiguredBackend()) {
    try {
      const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
      if (!error) supabaseStatus = "up";
    } catch {
      supabaseStatus = "down";
    }
  } else {
    supabaseStatus = "mock";
  }
  
  const isHealthy = supabaseStatus !== "down" && geminiStatus !== "down";

  res.json({
    status: isHealthy ? "healthy" : "unhealthy",
    services: {
      supabase: supabaseStatus,
      gemini: geminiStatus,
      razorpay: razorpayStatus
    },
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
}

export function getVersion(req: Request, res: Response) {
  res.json({
    version: "2.0.0",
    build: "abc123",
    environment: process.env.NODE_ENV || "development"
  });
}
