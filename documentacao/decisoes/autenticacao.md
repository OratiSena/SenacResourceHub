# Autenticação — Senac ResourceHub

Documento técnico da implementação de autenticação (Prompt 4). Complementa `documentacao/decisoes/banco-de-dados.md` (RLS, `is_admin()`, `handle_new_user`) sem duplicá-lo — aqui o foco é a camada de aplicação (Next.js) sobre esse banco já existente.

## Variáveis de ambiente

O Supabase renomeou a antiga *anon key* para *publishable key*. O projeto usa exclusivamente os nomes atuais:

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — chave pública, segura para o navegador (o acesso a dados continua protegido por RLS).

Nenhuma secret/service_role key é usada nesta etapa. Os valores reais ficam apenas em `.env.local` (ignorado pelo Git); `.env.example` documenta somente os nomes.

## Clients Supabase

- `lib/supabase/client.ts` — `createBrowserClient<Database>`, para Client Components.
- `lib/supabase/server.ts` — `createServerClient<Database>`, para Server Components/Actions, com adaptador de cookies via `next/headers`.
- `lib/supabase/proxy.ts` — mesma ideia, mas com adaptador de cookies via `NextRequest`/`NextResponse`, para uso em `proxy.ts`.

Nenhum dos três usa `getSession()` para decidir autorização — todos usam `getClaims()`, que valida a assinatura do JWT (localmente via JWKS quando o projeto usa chaves assimétricas, ou contra o Auth Server quando ainda usa segredo simétrico) antes de confiar no conteúdo.

## Proxy (`proxy.ts` + `lib/supabase/proxy.ts`)

O Next.js 16 renomeou `middleware.ts` para `proxy.ts` (mesma API — `NextRequest`/`NextResponse`, mesmo `config.matcher`). `updateSession()`:

1. Recria o client Supabase a cada requisição com um adaptador de cookies que reescreve a resposta sempre que a sessão é atualizada — é isso que mantém o refresh de sessão funcionando de forma transparente no SSR.
2. Chama `getClaims()` para saber se há usuário autenticado.
3. Redireciona para `/login` quem tentar acessar uma rota protegida sem sessão.
4. Redireciona para `/` ou `/admin` (conforme `profiles.role`) quem, já autenticado, tentar abrir `/login` ou `/cadastro`.

O proxy **não** faz a checagem fina de role para `/admin` — só "autenticado ou não". Isso é deliberado: a própria documentação oficial do Next.js para Proxy recomenda não depender só dele para autorização, porque um matcher mal configurado pode silenciosamente deixar de proteger uma rota. Por isso cada rota sensível reverifica no próprio Server Component (ver `lib/auth/current-profile.ts`).

Rotas públicas (não exigem sessão): `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`, `/auth/confirm`, `/termos`, `/privacidade`. `/design-system` também fica fora do fluxo de autenticação (rota de desenvolvimento).

## `lib/auth/current-profile.ts`

`getCurrentProfile()` (envolvida em `React.cache()`) é o único lugar que combina "há sessão válida" (`getClaims()`) com "quem é esse usuário" (`profiles`, por `id`). O `cache()` garante que o layout autenticado e uma página como `/admin` compartilhem a mesma consulta dentro da mesma requisição, sem duplicar a busca. Retorna `null` sem sessão; nunca lança — quem chama decide o que fazer (redirecionar, renderizar um fallback).

## Estrutura de rotas

```
app/
  (auth)/          — layout público, sem sidebar/header (login, cadastro, esqueci-senha, redefinir-senha)
  (app)/           — layout protegido, com AppShell (Home, Admin)
  auth/confirm/    — route handler SSR (token_hash + verifyOtp)
  design-system/   — inalterado, fora do fluxo de auth
  termos/, privacidade/ — páginas públicas simples
```

Os route groups `(auth)` e `(app)` não aparecem na URL — `/login`, `/`, `/admin` etc. permanecem exatamente como especificado.

## Fluxo de login

1. `components/auth/login-form.tsx` (Client) usa `useActionState(loginAction, ...)`.
2. `loginAction` (`lib/actions/auth.ts`) valida com Zod (`lib/validations/auth.ts`), chama `signInWithPassword`, busca `profiles.role` pelo `user.id` retornado, e redireciona: `admin` → `/admin`, qualquer outro caso → `/`.
3. Erros do Supabase nunca são repassados literalmente: `email_not_confirmed` vira uma mensagem específica orientando a confirmar o e-mail; qualquer outra falha vira "Credenciais inválidas." — sem indicar se o problema foi o e-mail ou a senha (evita user enumeration).
4. Sessão já existente acessando `/login` ou `/cadastro`: o proxy redireciona antes mesmo de a página renderizar.

## Fluxo de cadastro

1. Cadastro público só pode criar `role = 'user'` — não existe campo de seleção de role no formulário, e mesmo que existisse, a migration `handle_new_user` ignora qualquer valor enviado e sempre grava `'user'` (ver `supabase/migrations/20250601090003_handle_new_user.sql`).
2. A metadata enviada em `signUp({ options: { data: { nome } } })` usa a chave `nome` — confirmado lendo a migration antes de implementar, que lê exatamente `new.raw_user_meta_data->>'nome'`.
3. Checkbox de aceite dos Termos/Privacidade é obrigatório (validado tanto por `required` nativo quanto pelo schema Zod no servidor).
4. `signUp` cobre os dois cenários possíveis (Prompt 4, seção 14):
   - **Sem confirmação de e-mail**: `data.session` vem preenchido → redireciona direto para `/`.
   - **Com confirmação de e-mail** (é o caso atual do projeto remoto — ver seção seguinte): `data.session` vem `null` → mostra "Verifique seu e-mail para confirmar sua conta antes de entrar." e um botão para ir ao login.
5. E-mail duplicado (`user_already_exists`) mostra a mensagem definida no documento de requisitos: "E-mail já cadastrado. Utilize outro e-mail."

## Confirmação de e-mail

O projeto Cloud está com confirmação de e-mail **habilitada** (`auth.email.enable_confirmations = true` no remoto — diferente do `supabase/config.toml` local, que serve só para o stack local via Docker). `app/auth/confirm/route.ts` implementa a abordagem oficial atual para Next.js SSR: lê `token_hash` e `type` da URL e chama `supabase.auth.verifyOtp({ type, token_hash })` no servidor — nunca `verifyOtp` no cliente. Em caso de sucesso, redireciona para o parâmetro `next` (`/` para cadastro, `/redefinir-senha` para recuperação); em caso de falha, redireciona para `/login?erro=link-invalido`, que exibe um aviso amigável.

**Configuração manual pendente no Dashboard** (ver checklist no fim deste documento) — os templates de e-mail padrão do Supabase apontam para o endpoint de verificação hospedado pelo próprio Supabase (`{{ .ConfirmationURL }}`), não para a nossa rota `/auth/confirm`. Precisam ser editados para usar `token_hash`/`type` explicitamente.

## Recuperação e redefinição de senha

- `/esqueci-senha` chama `resetPasswordForEmail(email, { redirectTo })`. A mensagem exibida é sempre a mesma, exista ou não conta com aquele e-mail: "Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinir sua senha." — evita user enumeration.
- O link do e-mail (após o Dashboard ser configurado) leva a `/auth/confirm?token_hash=...&type=recovery&next=/redefinir-senha`, que estabelece uma sessão temporária e só então redireciona para `/redefinir-senha`.
- `/redefinir-senha` é um Server Component que verifica `getClaims()` **antes** de renderizar o formulário: sem sessão válida, mostra "Link inválido ou expirado" com um caminho de volta para solicitar nova recuperação — a página nunca fica disponível para quem não passou pelo link.
- Com sessão válida, o formulário (`components/auth/reset-password-form.tsx`) chama `updateUser({ password })`. Sucesso mostra a mensagem de confirmação e um botão "Entrar no sistema" apontando para `/` (a sessão da recuperação já é uma sessão válida, não é necessário logar de novo).

## Logout

`logoutAction` (Server Action) chama `supabase.auth.signOut()` e redireciona para `/login`. Acionado pelo item "Sair" no menu do `AppHeader`.

## Role e redirecionamento

Só existem dois papéis funcionais (`user`, `admin`), lidos sempre de `profiles.role` — nunca de metadata do formulário ou do token de signup. `getCurrentProfile()` é a única fonte usada pela aplicação para decidir o que mostrar/redirecionar. A proteção real contra auto-promoção já existe no banco (triggers `handle_new_user` e `protect_profile_privileged_fields`, ver `banco-de-dados.md`); a aplicação nunca tenta contornar ou duplicar essa regra, apenas confia nela.

`/admin` (`app/(app)/admin/page.tsx`) reverifica `profile.role === "admin"` no servidor e redireciona para `/` caso contrário — esconder o item "Admin" na sidebar (`AppSidebar`, prop `showAdmin`) é só conveniência visual, nunca a proteção real.

## AppShell com usuário real

`AppShell`, `AppHeader` e `AppSidebar` (Prompt 3) passaram a receber os dados do usuário por props (`AppShellUser`: `nome`, `subtitulo`, `iniciais`, `role`) em vez de importar `DEMO_USER` diretamente. `app/(app)/layout.tsx` monta esse objeto a partir do profile real; `app/design-system/layout.tsx` é o único lugar que ainda monta esse objeto a partir de `DEMO_USER` (com `role: "admin"` fixo, só para demonstrar visualmente o item Admin da sidebar).

## Erros tratados

Campos vazios/e-mail inválido/senha curta/senhas diferentes: validados com Zod (`lib/validations/auth.ts`), mensagens em português, exibidas por campo. Falha de rede ou erro inesperado do Supabase: mensagem genérica, nunca stack trace/detalhe interno. Sessão expirada: o proxy detecta a ausência de claims válidas e redireciona para `/login` na próxima navegação. Profile ausente: `getCurrentProfile()` retorna um fallback seguro (role `user`, nome a partir do e-mail) em vez de quebrar a página — este caso não deveria ocorrer na prática, já que `handle_new_user` é o único caminho de criação de `profiles`.

## Checklist de configuração manual do Supabase Dashboard

Confirmado via `npx supabase config diff` que o projeto remoto já tem `site_url = http://localhost:3000` (correto, nenhuma ação necessária) e `enable_confirmations = true`. Três itens **ainda pendentes**, só possíveis pelo Dashboard (não fazem parte do que `supabase db push`/migrations conseguem alterar):

1. **Authentication → URL Configuration → Redirect URLs**: adicionar `http://localhost:3000/**` (hoje a lista está vazia, o que pode bloquear os `redirectTo`/`emailRedirectTo` que a aplicação envia).
2. **Authentication → Emails → Templates → "Confirm signup"**: trocar o link padrão (`{{ .ConfirmationURL }}`) por `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/`.
3. **Authentication → Emails → Templates → "Reset Password"**: trocar o link padrão por `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/redefinir-senha`.

Sem esses três ajustes, os e-mails reais de confirmação/recuperação continuam sendo enviados normalmente, mas o link neles aponta para o verificador hospedado pelo próprio Supabase em vez da nossa rota `/auth/confirm` — a criação de conta e o login continuam funcionando (validado com um usuário de teste confirmado diretamente via SQL, ver relatório do Prompt 4), só o clique no e-mail real de um usuário não passaria pela nossa tela.
