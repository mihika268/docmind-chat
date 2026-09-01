import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Server-side Supabase client using the Service Role key.
// This client bypasses Row Level Security (RLS) and must only be used
// in trusted server-side code.

function createSupabaseAdminClient() {
  const supabaseUrl = process.env["SUPABASE_URL"]?.trim();
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [
      !supabaseUrl ? "SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);

    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}.`,
    );
  }

  // Use Supabase's default fetch implementation in the server runtime.
  // Avoid a custom fetch wrapper because it can interfere with the
  // runtime's Request/Headers handling and cause opaque "fetch failed" errors.
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

let _supabaseAdmin:
  | ReturnType<typeof createSupabaseAdminClient>
  | undefined;

// Import this module only from server-side code.
export const supabaseAdmin = new Proxy(
  {} as ReturnType<typeof createSupabaseAdminClient>,
  {
    get(_, prop, receiver) {
      _supabaseAdmin ??= createSupabaseAdminClient();
      return Reflect.get(_supabaseAdmin, prop, receiver);
    },
  },
);
