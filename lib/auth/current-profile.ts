import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  id: string;
  nome: string;
  email: string;
  role: "user" | "admin";
  categoria: string | null;
  status: "active" | "deleted";
}

/**
 * Usuário autenticado + seu profile, para uso em Server Components/Actions.
 * `cache()` garante que múltiplos componentes na mesma requisição (ex.: o
 * layout autenticado e a página /admin) compartilhem a mesma consulta, sem
 * repetir a busca ao Auth Server e ao banco.
 *
 * Retorna `null` quando não há sessão válida — nunca lança. Quem chama
 * decide o que fazer (redirecionar para /login, etc.), seguindo a
 * recomendação do Next.js de sempre reverificar autenticação/autorização em
 * cada rota, não confiar apenas no proxy.
 */
export const getCurrentProfile = cache(
  async (): Promise<CurrentProfile | null> => {
    const supabase = await createClient();

    const { data: claimsData } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;
    if (!claims) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nome, email, role, categoria, status")
      .eq("id", claims.sub)
      .maybeSingle();

    if (!profile) {
      // Profile ausente (não deveria acontecer — handle_new_user é o único
      // caminho de criação — mas trata sem quebrar a página, com um
      // fallback seguro em vez de assumir privilégio nenhum).
      return {
        id: claims.sub,
        nome: claims.email ?? "Usuário",
        email: claims.email ?? "",
        role: "user",
        categoria: null,
        status: "active",
      };
    }

    return profile;
  },
);
