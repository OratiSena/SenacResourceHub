import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para uso em Client Components. Usa apenas a publishable
 * key (pública, protegida por RLS — substitui a antiga anon key) — nunca a
 * secret/service_role key.
 *
 * `database.types.ts` é gerado a partir do schema remoto via
 * `npx supabase gen types typescript --linked` — não editar manualmente.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
