-- Cria automaticamente um profile quando um usuário é criado em auth.users.
-- role é sempre fixado como 'user' aqui — não existe caminho de cadastro
-- público que resulte em role = 'admin' (ver contexto-projeto.md, seção 1.6 e
-- CLAUDE.md: "Nunca permita que um usuário comum possa promover a si mesmo
-- para admin"). O primeiro administrador do sistema precisa ser promovido
-- manualmente por uma operação de servidor/dashboard (ex.: UPDATE profiles
-- SET role = 'admin' executado com a service_role key ou pelo SQL editor do
-- Supabase), nunca pela aplicação.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'nome'), ''), split_part(new.email, '@', 1)),
    new.email,
    'user'
  );
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Cria o profile correspondente a um novo usuário do Supabase Auth. Único caminho de criação de linhas em public.profiles.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
