-- Corrige um problema descoberto ao validar o fluxo de "primeiro admin"
-- (Prompt 7-9, Fase C): o trigger protect_profile_privileged_fields chama
-- public.is_admin(), que depende de auth.uid(). Numa conexão direta ao
-- Postgres (SQL Editor do Supabase Studio, ou `supabase db query`, ambas
-- rodando como o role "postgres"), auth.uid() é NULL — logo is_admin()
-- retorna false e o trigger reverte qualquer tentativa de promover alguém a
-- admin, mesmo com acesso de superusuário. Ou seja, o comando SQL de
-- bootstrap documentado para criar o primeiro admin
-- ("UPDATE public.profiles SET role='admin' WHERE email=...") não
-- funcionava.
--
-- Correção: a restrição do trigger só faz sentido quando existe um usuário
-- autenticado da aplicação por trás da alteração (auth.uid() is not null) —
-- é esse o caminho que precisa ser bloqueado para não-admins. Quando
-- auth.uid() é NULL, a chamada só pode vir de acesso direto ao banco
-- (superusuário/service_role via SQL Editor ou CLI), nunca da API pública:
-- as policies de RLS de profiles são "to authenticated" (sem policy para
-- anon), então uma requisição anônima via PostgREST nunca chega a executar
-- este trigger. Liberar a alteração quando auth.uid() is null não abre
-- brecha nova — apenas torna funcional o bootstrap administrativo via SQL
-- direto, que é exatamente o caminho de acesso restrito que já era
-- necessário (só quem tem credenciais de banco consegue rodar esse UPDATE).
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    if not (old.status = 'active' and new.status = 'deleted' and new.id = auth.uid()) then
      new.status := old.status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
