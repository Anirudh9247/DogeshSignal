/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return (
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};

export async function handleSupabaseCall<T>(
  supabaseCall: () => Promise<T>,
  devFallback: () => Promise<T>,
  prodErrorMessage: string
): Promise<T> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseCall();
    } catch (err) {
      const isProd = import.meta.env.PROD;
      if (isProd) {
        console.error(`[SUPABASE PROD ERROR] ${prodErrorMessage}:`, err);
        throw new Error("Cloud services are temporarily unavailable. Please try again later.");
      } else {
        console.warn(`[SUPABASE DEV WARNING] Call failed, falling back to mock:`, err);
        return await devFallback();
      }
    }
  }
  return await devFallback();
}
