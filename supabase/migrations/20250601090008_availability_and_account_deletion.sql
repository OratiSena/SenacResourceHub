-- Prompt 7-9: disponibilidade por período, regras de horário/duração em
-- create_reservation, e exclusão de conta (delete_my_account).

-- ---------------------------------------------------------------------------
-- 1. Disponibilidade: intervalos ocupados de um resource num período.
-- ---------------------------------------------------------------------------
-- RLS de `reservations` só deixa cada usuário ver as PRÓPRIAS reservas — de
-- propósito, para não vazar quem reservou o quê. Para renderizar o
-- calendário (quantas unidades estão ocupadas em cada horário), qualquer
-- usuário autenticado precisa enxergar os INTERVALOS ocupados de um recurso
-- sem saber de quem são. Esta função (security definer) devolve só
-- resource_unit_id + início/fim das reservas ATIVAS que se sobrepõem ao
-- período pedido — nunca user_id, finalidade ou observações.
create or replace function public.get_resource_busy_intervals(
  p_resource_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  resource_unit_id uuid,
  data_hora_inicio timestamptz,
  data_hora_fim timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.resource_unit_id, r.data_hora_inicio, r.data_hora_fim
  from public.reservations r
  where r.resource_id = p_resource_id
    and r.status = 'ATIVA'
    and r.resource_unit_id is not null
    and r.data_hora_inicio < p_end
    and r.data_hora_fim > p_start;
$$;

comment on function public.get_resource_busy_intervals(uuid, timestamptz, timestamptz) is
  'Intervalos ATIVOS de um resource num período, sem expor user_id/finalidade — usado para renderizar disponibilidade no calendário.';

revoke all on function public.get_resource_busy_intervals(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_resource_busy_intervals(uuid, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. create_reservation: adiciona as regras de horário de funcionamento,
--    duração máxima e antecedência mínima (Prompt 7, seção A3), que a versão
--    original (Prompt 2) ainda não validava. A atribuição atômica de
--    unidade (exclusion constraint + FOR UPDATE SKIP LOCKED) continua
--    idêntica — só foram adicionadas checagens ANTES dela.
-- ---------------------------------------------------------------------------
create or replace function public.create_reservation(
  p_resource_id uuid,
  p_data_hora_inicio timestamptz,
  p_data_hora_fim timestamptz,
  p_finalidade text,
  p_observacoes text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_resource public.resources%rowtype;
  v_reservation public.reservations%rowtype;
  v_candidate record;
  v_inicio_local time;
  v_fim_local time;
begin
  if v_user_id is null then
    raise exception 'Usuario nao autenticado' using errcode = '28000';
  end if;

  if p_data_hora_fim <= p_data_hora_inicio then
    raise exception 'Horario de termino deve ser posterior ao horario de inicio' using errcode = 'check_violation';
  end if;

  select * into v_resource from public.resources where id = p_resource_id;
  if not found then
    raise exception 'Recurso nao encontrado' using errcode = 'no_data_found';
  end if;
  if not v_resource.ativo then
    raise exception 'Recurso indisponivel para reservas' using errcode = 'check_violation';
  end if;

  -- Antecedência mínima (substitui a checagem antiga de "não reservar no
  -- passado" — com antecedencia_minima_minutos = 0, o comportamento é
  -- idêntico ao original).
  if p_data_hora_inicio < now() + make_interval(mins => v_resource.antecedencia_minima_minutos) then
    raise exception
      'É necessário reservar com pelo menos % minutos de antecedência',
      v_resource.antecedencia_minima_minutos
      using errcode = 'check_violation';
  end if;

  -- Duração máxima por reserva, quando configurada.
  if v_resource.duracao_maxima_minutos is not null
     and extract(epoch from (p_data_hora_fim - p_data_hora_inicio)) / 60 > v_resource.duracao_maxima_minutos then
    raise exception
      'A duração máxima para este recurso é de % minutos',
      v_resource.duracao_maxima_minutos
      using errcode = 'check_violation';
  end if;

  -- Horário de funcionamento, quando configurado. Comparado no fuso do
  -- Senac (America/Sao_Paulo), já que horario_abertura/fechamento são
  -- horários locais, não UTC.
  if v_resource.horario_abertura is not null and v_resource.horario_fechamento is not null then
    v_inicio_local := (p_data_hora_inicio at time zone 'America/Sao_Paulo')::time;
    v_fim_local := (p_data_hora_fim at time zone 'America/Sao_Paulo')::time;
    if v_inicio_local < v_resource.horario_abertura or v_fim_local > v_resource.horario_fechamento then
      raise exception
        'Reserva fora do horário de funcionamento (% às %)',
        v_resource.horario_abertura, v_resource.horario_fechamento
        using errcode = 'check_violation';
    end if;
  end if;

  if v_resource.is_shared_space then
    insert into public.reservations (
      user_id, resource_id, resource_unit_id,
      data_hora_inicio, data_hora_fim, finalidade, observacoes
    ) values (
      v_user_id, p_resource_id, null,
      p_data_hora_inicio, p_data_hora_fim, p_finalidade, p_observacoes
    )
    returning * into v_reservation;

    return v_reservation;
  end if;

  for v_candidate in
    select id
    from public.resource_units
    where resource_id = p_resource_id
      and status = 'disponivel'
    order by codigo
    for update skip locked
  loop
    begin
      insert into public.reservations (
        user_id, resource_id, resource_unit_id,
        data_hora_inicio, data_hora_fim, finalidade, observacoes
      ) values (
        v_user_id, p_resource_id, v_candidate.id,
        p_data_hora_inicio, p_data_hora_fim, p_finalidade, p_observacoes
      )
      returning * into v_reservation;

      return v_reservation;
    exception
      when exclusion_violation then
        continue;
    end;
  end loop;

  raise exception 'Nenhuma unidade disponivel para o periodo informado' using errcode = 'P0001';
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Permite a transição active -> deleted na própria linha fora de um
--    contexto de admin (autoexclusão de conta) — toda outra transição de
--    role/status continua bloqueada fora de admin, como antes.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    if not (old.status = 'active' and new.status = 'deleted' and new.id = auth.uid()) then
      new.status := old.status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. delete_my_account: autoexclusão de conta (Prompt 7-9, Fase B8).
--    Opera exclusivamente sobre auth.uid() — nunca aceita um id vindo do
--    cliente. Cancela reservas futuras, anonimiza o profile (preservado para
--    o histórico) e remove as credenciais de auth.users (cascade cuida de
--    identities/sessions/refresh tokens, ver documentacao/decisoes).
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Usuario nao autenticado' using errcode = '28000';
  end if;

  update public.reservations
  set status = 'CANCELADA',
      cancelado_em = now(),
      cancelado_por = v_uid
  where user_id = v_uid
    and status = 'ATIVA'
    and data_hora_fim > now();

  update public.profiles
  set nome = 'Usuário removido',
      email = 'removido-' || v_uid::text || '@anon.local',
      telefone = null,
      curso = null,
      unidade_campus = null,
      matricula = null,
      categoria = null,
      status = 'deleted'
  where id = v_uid;

  delete from auth.users where id = v_uid;
end;
$$;

comment on function public.delete_my_account() is
  'Autoexclusão de conta: opera só sobre auth.uid(), nunca aceita id do cliente. Cancela reservas futuras, anonimiza profiles (preservado), remove auth.users (cascade cuida do resto).';

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
