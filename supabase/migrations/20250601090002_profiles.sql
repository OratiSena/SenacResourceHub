-- profiles: dados de aplicação do usuário, espelhando auth.users.
--
-- DECISÃO IMPORTANTE: profiles.id NÃO possui foreign key para auth.users(id).
-- Isso é intencional (não um esquecimento). A estratégia de exclusão de conta
-- (soft delete, ver contexto-projeto.md seção 8) exige remover as credenciais
-- em auth.users via Admin API, mas manter a linha de profiles como registro
-- histórico para que reservations.user_id continue íntegro. Em Postgres, uma
-- FK só permite CASCADE, SET NULL/DEFAULT ou RESTRICT ao apagar o pai — não
-- existe uma opção de "deixar o pai ser apagado e ignorar o filho". Como
-- queremos exatamente isso (apagar auth.users, preservar profiles com o mesmo
-- id), a única forma correta é não ter a constraint de FK. A integridade é
-- garantida pelo trigger on_auth_user_created (próxima migration), que é o
-- único caminho que cria linhas em profiles.
create table public.profiles (
  id uuid primary key,
  nome text not null,
  email text not null,
  role public.user_role not null default 'user',
  telefone text,
  curso text,
  unidade_campus text,
  matricula text,
  categoria text,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nome_length check (
    char_length(nome) between 1 and 100 and btrim(nome) <> ''
  ),
  constraint profiles_email_length check (char_length(email) <= 100)
);

comment on table public.profiles is
  'Dados de aplicação do usuário. Sem FK para auth.users por decisão de design (ver comentário na definição da tabela) — sincronizada apenas pelo trigger on_auth_user_created.';

-- Verifica o papel do usuário autenticado sem recursão de RLS: como é
-- security definer, esta função ignora as políticas de RLS de profiles ao
-- fazer sua própria consulta interna, evitando o problema clássico de uma
-- policy de profiles precisar consultar profiles para se avaliar.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

comment on function public.is_admin() is
  'Verifica se o usuário autenticado é admin ativo. security definer para evitar recursão de RLS em profiles; é a base da estratégia de autorização administrativa do projeto.';

-- Trigger de proteção: garante em nível de banco que um usuário comum nunca
-- consegue alterar seu próprio role ou status via UPDATE direto, mesmo que a
-- policy de RLS permita a ele atualizar a própria linha (ela permite, para
-- que ele edite nome/telefone/curso/unidade_campus). Somente uma chamada feita
-- por um admin (is_admin() = true) pode alterar esses dois campos.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem policy de INSERT: a única via de criação é o trigger em auth.users
-- (security definer, bypassa RLS). Sem policy de DELETE: profiles nunca é
-- apagada, apenas anonimizada e marcada status = 'deleted'.
