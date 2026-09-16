import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em Client Components. Usa apenas a anon key
 * (pública, protegida por RLS) — nunca a service_role key.
 *
 * Os tipos gerados a partir do banco (Database) ainda não existem nesta
 * etapa — ver documentacao/decisoes/banco-de-dados.md. Assim que forem
 * gerados via `npx supabase gen types typescript`, importe `Database` de
 * `./database.types` e passe como generic: `createBrowserClient<Database>(...)`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
