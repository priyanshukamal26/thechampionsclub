import { createClient } from "@supabase/supabase-js";

/**
 * Sanitizes Supabase URL to handle duplicated, corrupted, or malformed environment variables.
 * For example: if a user accidentally pasted the URL multiple times in Vercel:
 * "fvagpcmqapwddyyxhwlz.supabase.cohttps//fvagpcmqapwddyyxhwlz.supabase.co..."
 * this extracts the clean project ref and builds "https://fvagpcmqapwddyyxhwlz.supabase.co".
 */
export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "https://placeholder-championsclub.supabase.co";
  const trimmed = rawUrl.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "https://placeholder-championsclub.supabase.co";

  // 1. Detect standard 20-character Supabase project ref before .supabase.co
  const match = trimmed.match(/([a-z0-9]{20})\.supabase\.co/i);
  if (match) {
    return `https://${match[1].toLowerCase()}.supabase.co`;
  }

  // 2. Self-heal specific club project ref if corrupted with stray keystrokes (e.g. fva...gpcmqapwddyyxhwlz)
  if (trimmed.includes("gpcmqapwddyyxhwlz") || trimmed.includes("fvagpcmq")) {
    return "https://fvagpcmqapwddyyxhwlz.supabase.co";
  }

  // 3. If user pasted just the 20-character project ref
  if (/^[a-z0-9]{20}$/i.test(trimmed)) {
    return `https://${trimmed.toLowerCase()}.supabase.co`;
  }

  // 3. Fallback for custom domains or self-hosted Supabase
  let cleaned = trimmed.replace(/^(https?:\/\/)+/i, "");
  cleaned = cleaned.split("http")[0].replace(/\/+$/, "");
  return `https://${cleaned}`;
}

/**
 * Sanitizes the Supabase Anon Key by trimming whitespace and quotation marks.
 */
export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return "placeholder-anon-key";
  return rawKey.trim().replace(/^["']|["']$/g, "");
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = sanitizeSupabaseKey(rawAnonKey);

export const isSupabaseConfigured =
  Boolean(rawUrl && !rawUrl.includes("placeholder")) &&
  Boolean(rawAnonKey && !rawAnonKey.includes("placeholder")) &&
  supabaseAnonKey !== "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
