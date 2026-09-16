-- Trigger genérico de updated_at, reutilizado por resources, resource_units
-- e reservations (profiles tem seu próprio trigger combinado, ver migration
-- anterior, porque também precisa proteger role/status).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- resources: o TIPO de recurso que o usuário reserva (ex.: "Osciloscópio"),
-- nunca uma unidade física específica — ver contexto-projeto.md, seção 1.4.
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  tipo public.resource_type not null,
  descricao text,
  local text,
  imagens text[] not null default '{}',
  modelo_3d_url text,
  duracao_maxima_minutos integer,
  antecedencia_minima_minutos integer not null default 0,
  horario_abertura time,
  horario_fechamento time,
  orientacoes_seguranca text[],
  is_shared_space boolean not null default false,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint resources_nome_length check (
    char_length(nome) between 1 and 150 and btrim(nome) <> ''
  ),
  constraint resources_duracao_maxima_positiva check (
    duracao_maxima_minutos is null or duracao_maxima_minutos > 0
  ),
  constraint resources_antecedencia_minima_nao_negativa check (
    antecedencia_minima_minutos >= 0
  ),
  constraint resources_horario_coerente check (
    horario_abertura is null or horario_fechamento is null or horario_fechamento > horario_abertura
  ),
  -- Mantém is_shared_space e tipo sempre consistentes: hoje só a Oficina de
  -- Fabricação e Prototipagem é espaço compartilhado, mas a regra é expressa
  -- de forma genérica (por tipo, não por nome do recurso).
  constraint resources_shared_space_consistente check (
    is_shared_space = (tipo = 'espaco_compartilhado')
  )
);

comment on table public.resources is
  'Tipos de recurso reservável (ex.: Osciloscópio, Bambu Lab A1). O usuário reserva um resource; a resource_unit é atribuída automaticamente.';
comment on column public.resources.is_shared_space is
  'true somente para tipo = espaco_compartilhado (ex.: Oficina). Recursos desse tipo não possuem resource_units e não têm checagem de conflito de horário.';

create index resources_tipo_idx on public.resources (tipo);
create index resources_ativo_idx on public.resources (ativo);

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

alter table public.resources enable row level security;

-- Usuários autenticados veem recursos ativos; admins veem todos (inclusive
-- inativos, necessário para a área de gestão).
create policy "resources_select"
  on public.resources for select
  to authenticated
  using (ativo = true or public.is_admin());

create policy "resources_insert_admin"
  on public.resources for insert
  to authenticated
  with check (public.is_admin());

create policy "resources_update_admin"
  on public.resources for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "resources_delete_admin"
  on public.resources for delete
  to authenticated
  using (public.is_admin());
