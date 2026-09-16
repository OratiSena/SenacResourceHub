-- resource_units: cada equipamento/sala físico individual (ex.: OSC-04).
-- on delete restrict em resource_id: um recurso com unidades cadastradas não
-- pode ser apagado — o caminho correto é desativar (resources.ativo = false)
-- ou colocar a unidade em manutenção/inativa. Isso evita apagar acidentalmente
-- unidades que têm reservations associadas (reservations também usa restrict,
-- ver próxima migration), preservando sempre o histórico.
create table public.resource_units (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete restrict,
  codigo text not null unique,
  status public.unit_status not null default 'disponivel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_units_codigo_length check (
    char_length(codigo) between 1 and 30 and btrim(codigo) <> ''
  )
);

comment on table public.resource_units is
  'Unidade física individual de um resource (ex.: OSC-04). Não existe status "reservado": a ocupação em um período é calculada a partir de reservations ATIVA sobrepostas. A Oficina de Fabricação e Prototipagem nunca tem linhas aqui (ver trigger resource_units_prevent_shared_space).';

create index resource_units_resource_id_idx on public.resource_units (resource_id);

create trigger resource_units_set_updated_at
  before update on public.resource_units
  for each row execute function public.set_updated_at();

-- Garante em nível de banco — não apenas por convenção do seed — que recursos
-- do tipo espaço compartilhado (is_shared_space = true) nunca recebem uma
-- resource_unit. Um CHECK constraint não pode consultar outra tabela, por
-- isso é necessário um trigger.
create or replace function public.prevent_units_for_shared_space()
returns trigger
language plpgsql
as $$
declare
  v_is_shared_space boolean;
begin
  select is_shared_space into v_is_shared_space
  from public.resources
  where id = new.resource_id;

  if v_is_shared_space then
    raise exception
      'Recursos do tipo espaco_compartilhado nao possuem resource_units (resource_id = %)',
      new.resource_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger resource_units_prevent_shared_space
  before insert or update on public.resource_units
  for each row execute function public.prevent_units_for_shared_space();

alter table public.resource_units enable row level security;

-- Necessário para calcular disponibilidade (código e status das unidades de
-- um recurso). Nada sensível é exposto por esta tabela. Segue a mesma regra
-- de visibilidade de resources: usuário comum só vê unidades de recursos
-- ativos; admin vê tudo.
create policy "resource_units_select"
  on public.resource_units for select
  to authenticated
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id and (r.ativo or public.is_admin())
    )
  );

create policy "resource_units_insert_admin"
  on public.resource_units for insert
  to authenticated
  with check (public.is_admin());

create policy "resource_units_update_admin"
  on public.resource_units for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "resource_units_delete_admin"
  on public.resource_units for delete
  to authenticated
  using (public.is_admin());
