// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[Supabase] Environment variables:", {
  supabaseUrl: supabaseUrl ? "[set]" : "[missing]",
  supabaseAnonKey: supabaseAnonKey ? "[set]" : "[missing]",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  throw new Error("Supabase client initialization failed");
}

console.log("[Supabase] Initializing client with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
