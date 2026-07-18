import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public browser credentials. The anon key is safe to ship to the client — the
// database enforces access with Row-Level Security, not the key. The service_role
// key must never appear here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Singleton browser Supabase client, or `null` when env vars are absent so the
 * app keeps running in guest-only mode (no sign-in) during local development
 * before a project is configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
