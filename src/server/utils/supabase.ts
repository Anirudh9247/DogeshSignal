import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseServiceKey || supabaseAnonKey || "placeholder"
);

export const isSupabaseConfiguredBackend = (): boolean => {
  return !!supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co" && (!!supabaseServiceKey || !!supabaseAnonKey);
};
