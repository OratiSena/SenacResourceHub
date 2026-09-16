import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/**
 * Rotas acessíveis sem sessão. Qualquer rota fora desta lista — e fora de
 * `/design-system`, que não participa do fluxo de autenticação — exige
 * usuário autenticado (Prompt 4, seção 6).
 */
const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/auth/confirm",
  "/termos",
  "/privacidade",
];

// Rotas que um usuário já autenticado não deve conseguir reabrir — ele é
// redirecionado para a própria área (seção 6/11).
const AUTH_ONLY_ROUTES = ["/login", "/cadastro"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Atualiza os cookies de sessão a cada requisição (refresh SSR) e aplica a
 * regra grossa de autenticação: autenticado vs. não autenticado. A
 * autorização fina por role (ex.: /admin) é responsabilidade de cada rota —
 * ver lib/auth/current-profile.ts — seguindo a recomendação oficial de não
 * confiar apenas no proxy para isso.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // NUNCA usar supabase.auth.getSession() aqui para decidir autorização —
  // ela apenas lê o cookie, sem validar a assinatura do JWT. getClaims()
  // verifica a assinatura (localmente via JWKS, ou contra o Auth Server
  // quando o projeto ainda assina com segredo simétrico) antes de confiar
  // no conteúdo.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isDesignSystem = pathname.startsWith("/design-system");
  const isPublicRoute = isRouteMatch(pathname, PUBLIC_ROUTES);

  if (!isAuthenticated && !isPublicRoute && !isDesignSystem) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isRouteMatch(pathname, AUTH_ONLY_ROUTES)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data!.claims.sub)
      .maybeSingle();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
