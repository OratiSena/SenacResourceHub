-- Corrige um bug no check de horário de funcionamento introduzido na
-- migration anterior (20250601090008): a condição original só testava
-- "início antes de abrir" OU "fim depois de fechar", comparando apenas o
-- ::time (hora do dia, sem data) de início/fim. Uma reserva que cruza a
-- meia-noite (ex.: 23:00–00:00) faz o horário de fim "dar a volta" para um
-- valor pequeno (00:00), que passa a ser < horario_fechamento mesmo sendo,
-- na prática, fora do expediente — a reserva era aceita indevidamente.
--
-- Correção: exigir que início e fim estejam dentro de [abertura, fechamento]
-- e que o fim seja estritamente posterior ao início em horário local — essa
-- última condição também rejeita qualquer reserva que atravesse a
-- meia-noite, já que nesse caso o horário de fim (hora do dia) aparece
-- numericamente menor ou igual ao de início.
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

  if p_data_hora_inicio < now() + make_interval(mins => v_resource.antecedencia_minima_minutos) then
    raise exception
      'É necessário reservar com pelo menos % minutos de antecedência',
      v_resource.antecedencia_minima_minutos
      using errcode = 'check_violation';
  end if;

  if v_resource.duracao_maxima_minutos is not null
     and extract(epoch from (p_data_hora_fim - p_data_hora_inicio)) / 60 > v_resource.duracao_maxima_minutos then
    raise exception
      'A duração máxima para este recurso é de % minutos',
      v_resource.duracao_maxima_minutos
      using errcode = 'check_violation';
  end if;

  if v_resource.horario_abertura is not null and v_resource.horario_fechamento is not null then
    v_inicio_local := (p_data_hora_inicio at time zone 'America/Sao_Paulo')::time;
    v_fim_local := (p_data_hora_fim at time zone 'America/Sao_Paulo')::time;
    if v_inicio_local < v_resource.horario_abertura
       or v_inicio_local >= v_resource.horario_fechamento
       or v_fim_local > v_resource.horario_fechamento
       or v_fim_local <= v_inicio_local then
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
