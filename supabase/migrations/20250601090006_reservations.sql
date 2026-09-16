-- reservations: uma reserva de um resource (com resource_unit atribuída
-- automaticamente) por um usuário, em um período.
--
-- on delete restrict em user_id/resource_id/resource_unit_id: reservations é
-- o histórico do sistema e nunca deve ser apagada em cascata — apagar um
-- profile, resource ou resource_unit que tenha reservations é bloqueado pelo
-- banco. cancelado_por também referencia profiles (quem cancelou, usuário ou
-- admin), mas pode ficar orfão de forma segura: se o perfil do cancelador for
-- necessário no futuro, ele também segue a mesma regra de nunca ser apagado
-- (apenas anonimizado), então esta FK nunca quebra na prática.
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  resource_id uuid not null references public.resources (id) on delete restrict,
  resource_unit_id uuid references public.resource_units (id) on delete restrict,
  data_hora_inicio timestamptz not null,
  data_hora_fim timestamptz not null,
  finalidade text not null,
  observacoes text,
  status public.reservation_status not null default 'ATIVA',
  cancelado_em timestamptz,
  cancelado_por uuid references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_periodo_valido check (data_hora_fim > data_hora_inicio),
  constraint reservations_finalidade_length check (
    char_length(finalidade) between 1 and 200 and btrim(finalidade) <> ''
  ),
  constraint reservations_observacoes_length check (
    observacoes is null or char_length(observacoes) <= 500
  ),
  -- cancelado_em e cancelado_por só existem junto com status = 'CANCELADA' —
  -- e toda reserva CANCELADA tem os dois preenchidos.
  constraint reservations_cancelamento_consistente check (
    (status = 'CANCELADA' and cancelado_em is not null and cancelado_por is not null)
    or
    (status = 'ATIVA' and cancelado_em is null and cancelado_por is null)
  )
);

comment on table public.reservations is
  'Reserva de um resource por um usuário. Apenas ATIVA/CANCELADA são persistidos; FUTURA/EM_USO/EXPIRADA são derivados na leitura (ver contexto-projeto.md, seção 4). resource_unit_id é obrigatório exceto para recursos de espaço compartilhado (Oficina).';
comment on column public.reservations.resource_unit_id is
  'Atribuída automaticamente pelo sistema (create_reservation), nunca escolhida pelo usuário. Null somente quando o resource é do tipo espaco_compartilhado.';

create index reservations_user_id_idx on public.reservations (user_id);
create index reservations_resource_id_idx on public.reservations (resource_id);
create index reservations_status_idx on public.reservations (status);

create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- resource_unit_id só pode ser null quando o resource é espaco_compartilhado,
-- e nunca pode ser null para os demais tipos. Assim como a regra equivalente
-- em resource_units, isso depende de outra tabela e por isso é um trigger,
-- não um CHECK constraint.
create or replace function public.validate_reservation_unit_assignment()
returns trigger
language plpgsql
as $$
declare
  v_is_shared_space boolean;
begin
  select is_shared_space into v_is_shared_space
  from public.resources
  where id = new.resource_id;

  if v_is_shared_space and new.resource_unit_id is not null then
    raise exception
      'Reservas de espaco_compartilhado nao devem ter resource_unit_id (resource_id = %)',
      new.resource_id
      using errcode = 'check_violation';
  end if;

  if not v_is_shared_space and new.resource_unit_id is null then
    raise exception
      'resource_unit_id e obrigatorio para reservas deste tipo de recurso (resource_id = %)',
      new.resource_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger reservations_validate_unit_assignment
  before insert or update on public.reservations
  for each row execute function public.validate_reservation_unit_assignment();

-- O CORAÇÃO da prevenção de condição de corrida (ver seção 7 do Prompt 2 e
-- contexto-projeto.md, risco nº1): uma exclusion constraint no Postgres,
-- usando GiST, impede que duas linhas com o MESMO resource_unit_id tenham
-- intervalos tstzrange que se sobreponham ('&&'), considerando apenas
-- reservas com status = 'ATIVA' (reservas canceladas não contam) e apenas
-- quando resource_unit_id não é nulo (a Oficina fica de fora, como esperado).
--
-- O limite '[)' (início inclusivo, fim exclusivo) faz reservas encostadas
-- serem aceitas: [10:00, 12:00) e [12:00, 14:00) não se sobrepõem.
--
-- Diferente de uma checagem feita em código de aplicação (SELECT para
-- verificar livre, depois INSERT), esta constraint é avaliada pelo próprio
-- Postgres de forma atômica no momento do INSERT/UPDATE, dentro da mesma
-- transação, tornando a condição de corrida estruturalmente impossível: se
-- duas transações concorrentes tentarem inserir reservas sobrepostas para a
-- mesma unidade, uma delas falhará com exclusion_violation (SQLSTATE 23P01),
-- não importa o timing.
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    resource_unit_id with =,
    tstzrange(data_hora_inicio, data_hora_fim, '[)') with &&
  )
  where (status = 'ATIVA' and resource_unit_id is not null);

alter table public.reservations enable row level security;

create policy "reservations_select_own"
  on public.reservations for select
  to authenticated
  using (user_id = auth.uid());

create policy "reservations_select_admin"
  on public.reservations for select
  to authenticated
  using (public.is_admin());

-- Sem policy de INSERT/UPDATE para usuários comuns: toda criação e
-- cancelamento de reserva de um usuário comum passa pelas funções
-- security definer create_reservation/cancel_reservation (próxima
-- migration), que são o único caminho capaz de atribuir unidade de forma
-- atômica e correta. Isso implementa diretamente a exigência do Prompt 2:
-- "Não use apenas: SELECT unidade livre e depois INSERT reservation".
create policy "reservations_insert_admin"
  on public.reservations for insert
  to authenticated
  with check (public.is_admin());

create policy "reservations_update_admin"
  on public.reservations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem policy de DELETE para ninguém: reservations nunca é apagada, apenas
-- cancelada (status = 'CANCELADA'), preservando o histórico.
