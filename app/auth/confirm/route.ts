import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint SSR de confirmação (Prompt 4, seção 14) — abordagem oficial atual
 * do Supabase para Next.js: token_hash + type na URL, verificados aqui no
 * servidor via verifyOtp (nunca no cliente). Usado tanto para confirmação de
 * cadastro (type=signup) quanto para recuperação de senha (type=recovery).
 *
 * Requer que os templates de e-mail "Confirm signup" e "Reset Password" no
 * Dashboard do Supabase apontem para esta rota — ver checklist manual em
 * documentacao/decisoes/autenticacao.md.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }
  }

  redirect("/login?erro=link-invalido");
}
