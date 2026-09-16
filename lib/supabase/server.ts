import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para uso em Server Components e Server Actions. Usa
 * apenas a anon key (pública, protegida por RLS) — nunca a service_role key.
 * Operações que exigem privilégio de servidor (ex.: excluir credenciais de
 * auth.users na etapa de exclusão de conta) terão seu próprio cliente
 * server-only com a service_role key quando essa funcionalidade for
 * implementada — nunca reaproveitar este client para isso.
 *
 * `database.types.ts` é gerado a partir do schema remoto via
 * `npx supabase gen types typescript --linked` — não editar manualmente.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` chamado a partir de um Server Component sem
            // middleware de sessão — seguro de ignorar aqui; a sessão será
            // atualizada quando o middleware de autenticação for
            // implementado (etapa de Auth).
          }
        },
      },
    },
  );
}
