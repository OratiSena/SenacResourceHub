-- Prompt 9.1: exclusão/desativação de usuário pelo Administrador.
--
-- Espelha a lógica de delete_my_account() (auto-exclusão), mas:
--   (1) recebe um target_user_id explícito em vez de operar só sobre
--       auth.uid();
--   (2) exige is_admin() do chamador;
--   (3) nunca permite que o admin exclua a própria conta por aqui (a conta
--       do próprio admin continua sendo gerenciada só pelo Perfil/
--       delete_my_account, para não haver dois caminhos de autoexclusão);
--   (4) nunca permite excluir o último administrador ativo do sistema —
--       mesma invariante já aplicada a demoteUserAction, estendida aqui
--       porque excluir o único admin teria o mesmo efeito prático de
--       remover seu acesso administrativo.
--
-- Segue o mesmo modelo de soft delete: cancela reservas futuras ATIVAs,
-- anonimiza o profile (preservado para o histórico de reservations) e
-- remove as credenciais em auth.users (cascade cuida de
-- identities/sessions/refresh tokens — já verificado em
-- documentacao/decisoes para delete_my_account).
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_target_role public.user_role;
  v_target_status public.profile_status;
  v_active_admins integer;
begin
  if v_caller is null then
    raise exception 'Usuario nao autenticado' using errcode = '28000';
  end if;

  if not public.is_admin() then
    raise exception 'Apenas administradores podem executar esta acao' using errcode = '42501';
  end if;

  if target_user_id = v_caller then
    raise exception 'Use a exclusao de conta no Perfil para excluir a propria conta' using errcode = 'check_violation';
  end if;

  select role, status into v_target_role, v_target_status
  from public.profiles
  where id = target_user_id;

  if not found then
    raise exception 'Usuario nao encontrado' using errcode = 'no_data_found';
  end if;

  if v_target_status = 'deleted' then
    raise exception 'Usuario ja foi excluido' using errcode = 'check_violation';
  end if;

  if v_target_role = 'admin' then
    select count(*) into v_active_admins
    from public.profiles
    where role = 'admin' and status = 'active';

    if v_active_admins <= 1 then
      raise exception 'E necessario manter pelo menos um administrador ativo no sistema' using errcode = 'check_violation';
    end if;
  end if;

  update public.reservations
  set status = 'CANCELADA',
      cancelado_em = now(),
      cancelado_por = v_caller
  where user_id = target_user_id
    and status = 'ATIVA'
    and data_hora_fim > now();

  update public.profiles
  set nome = 'Usuário removido',
      email = 'removido-' || target_user_id::text || '@anon.local',
      telefone = null,
      curso = null,
      unidade_campus = null,
      matricula = null,
      categoria = null,
      status = 'deleted'
  where id = target_user_id;

  delete from auth.users where id = target_user_id;
end;
$$;

comment on function public.admin_delete_user(uuid) is
  'Exclusao administrativa de usuario: exige is_admin() do chamador, nunca opera sobre a propria conta do admin, nunca remove o ultimo admin ativo. Cancela reservas futuras, anonimiza profile (preservado), remove auth.users.';

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
