import { createClient } from "@supabase/supabase-js";

// ✅ Ensure values are strings (avoids TS/runtime issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ✅ Better error message
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase ENV missing");
  throw new Error(
    "Missing Supabase environment variables. Check .env.local"
  );
}

// ✅ Create client (singleton)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});