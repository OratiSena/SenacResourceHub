-- create_reservation: único caminho sancionado para criar uma reserva.
--
-- Implementa a atribuição automática de unidade descrita no Prompt 2, seção 7,
-- combinando duas técnicas complementares:
--
-- 1. `for update skip locked` ao listar as resource_units candidatas
--    (status = 'disponivel', ordenadas por codigo): serve apenas para reduzir
--    CONTENÇÃO quando várias pessoas tentam reservar o mesmo recurso ao mesmo
--    tempo — cada transação concorrente pula as unidades já travadas por
--    outra e tenta uma diferente primeiro, evitando que todas disputem a
--    mesma linha.
-- 2. A exclusion constraint `reservations_no_overlap` (ver migration
--    20250601090006) é quem de fato GARANTE a ausência de sobreposição: se a
--    unidade escolhida já tiver uma reserva ATIVA sobreposta — inclusive uma
--    criada e commitada por outra transação enquanto esta função decidia —,
--    o INSERT falha com exclusion_violation e a função tenta a próxima
--    unidade candidata da lista. Isso é o que o Prompt 2 pede explicitamente
--    ao proibir "SELECT unidade livre e depois INSERT" como operações
--    independentes: aqui a decisão final de "esta unidade está livre" só é
--    confirmada pelo próprio INSERT, de forma atômica.
--
-- Para recursos do tipo espaco_compartilhado (a Oficina), nenhuma atribuição
-- ou checagem de conflito ocorre: a reserva é criada direto com
-- resource_unit_id = null.
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
begin
  if v_user_id is null then
    raise exception 'Usuario nao autenticado' using errcode = '28000';
  end if;

  if p_data_hora_fim <= p_data_hora_inicio then
    raise exception 'Horario de termino deve ser posterior ao horario de inicio' using errcode = 'check_violation';
  end if;

  if p_data_hora_inicio < now() then
    raise exception 'Nao e possivel reservar um horario no passado' using errcode = 'check_violation';
  end if;

  select * into v_resource from public.resources where id = p_resource_id;
  if not found then
    raise exception 'Recurso nao encontrado' using errcode = 'no_data_found';
  end if;
  if not v_resource.ativo then
    raise exception 'Recurso indisponivel para reservas' using errcode = 'check_violation';
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
        -- Esta unidade ja possui uma reserva ATIVA sobreposta a este
        -- periodo; tenta a proxima candidata.
        continue;
    end;
  end loop;

  raise exception 'Nenhuma unidade disponivel para o periodo informado' using errcode = 'P0001';
end;
$$;

comment on function public.create_reservation(uuid, timestamptz, timestamptz, text, text) is
  'Unico caminho sancionado para criar reservations. Atribui automaticamente uma resource_unit livre (ou null para espaco_compartilhado), de forma atomica e segura contra condicao de corrida.';

revoke all on function public.create_reservation(uuid, timestamptz, timestamptz, text, text) from public;
grant execute on function public.create_reservation(uuid, timestamptz, timestamptz, text, text) to authenticated;

-- cancel_reservation: único caminho sancionado para cancelar uma reserva.
-- Usuário comum: só a própria reserva, e só até 2 dias antes do início.
-- Admin: qualquer reserva, a qualquer momento.
create or replace function public.cancel_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_reservation public.reservations%rowtype;
begin
  if v_user_id is null then
    raise exception 'Usuario nao autenticado' using errcode = '28000';
  end if;

  v_is_admin := public.is_admin();

  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reserva nao encontrada' using errcode = 'no_data_found';
  end if;

  if v_reservation.status = 'CANCELADA' then
    raise exception 'Reserva ja esta cancelada' using errcode = 'check_violation';
  end if;

  if not v_is_admin then
    if v_reservation.user_id <> v_user_id then
      raise exception 'Sem permissao para cancelar esta reserva' using errcode = '42501';
    end if;

    if v_reservation.data_hora_inicio - now() < interval '2 days' then
      raise exception 'Cancelamento permitido somente ate 2 dias antes do inicio da reserva' using errcode = 'check_violation';
    end if;
  end if;

  update public.reservations
  set status = 'CANCELADA',
      cancelado_em = now(),
      cancelado_por = v_user_id
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

comment on function public.cancel_reservation(uuid) is
  'Unico caminho sancionado para cancelar reservations. Usuario comum: apenas a propria reserva, ate 2 dias antes do inicio. Admin: qualquer reserva, a qualquer momento.';

revoke all on function public.cancel_reservation(uuid) from public;
grant execute on function public.cancel_reservation(uuid) to authenticated;
