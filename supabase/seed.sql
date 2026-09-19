-- Catálogo inicial do Senac ResourceHub.
--
-- Idempotente de propósito (ON CONFLICT DO NOTHING em todo INSERT): pode ser
-- reexecutado com segurança em `supabase db reset`, que sempre roda as
-- migrations do zero e depois este arquivo.
--
-- Não cria usuários em auth.users nem senhas/hashes — dados de demonstração
-- de usuários serão tratados na etapa de autenticação (ver Prompt 2, seção 12).

-- 1. DI — Laboratório de Hardware (laboratório exclusivo, 1 unidade)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'di-laboratorio-hardware',
  'DI — Laboratório de Hardware',
  'laboratorio',
  'Estações completas para desenvolvimento e testes de hardware.',
  'Senac — Departamento de Inovação',
  240, 120, '08:00', '22:45'
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, 'DI-HW-01'
from public.resources r
where r.slug = 'di-laboratorio-hardware'
on conflict (codigo) do nothing;

-- 2. DI — Laboratório de Redes (laboratório exclusivo, 1 unidade)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'di-laboratorio-redes',
  'DI — Laboratório de Redes',
  'laboratorio',
  'Infraestrutura para prática de redes e configuração de sistemas.',
  'Senac — Departamento de Inovação',
  240, 120, '08:00', '22:45'
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, 'DI-REDES-01'
from public.resources r
where r.slug = 'di-laboratorio-redes'
on conflict (codigo) do nothing;

-- 3. Osciloscópio (equipamento, 12 unidades)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'osciloscopio',
  'Osciloscópio',
  'equipamento',
  'Equipamento de medição para análise de sinais elétricos.',
  'Senac — Laboratório de Eletrônica',
  240, 60, '08:00', '22:45'
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array[
  'OSC-01', 'OSC-02', 'OSC-03', 'OSC-04', 'OSC-05', 'OSC-06',
  'OSC-07', 'OSC-08', 'OSC-09', 'OSC-10', 'OSC-11', 'OSC-12'
]) as codigo
where r.slug = 'osciloscopio'
on conflict (codigo) do nothing;

-- 4. Bambu Lab A1 (impressora 3D, 3 unidades)
-- IMPORTANTE: o nome de exibição é sempre "Bambu Lab A1" — nunca
-- "Bambu Lab A1 Combo" (ver CLAUDE.md).
insert into public.resources (
  slug, nome, tipo, descricao, local, modelo_3d_url,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'bambu-lab-a1',
  'Bambu Lab A1',
  'impressora_3d',
  'Impressora 3D FDM de alta velocidade com sistema AMS para impressão multicolor.',
  'DI — Fabricação Digital',
  null,
  1440, 120, null, null
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array['BAMBU-A1-01', 'BAMBU-A1-02', 'BAMBU-A1-03']) as codigo
where r.slug = 'bambu-lab-a1'
on conflict (codigo) do nothing;

-- 5. Sethi3D — Impressora 3D de gabinete fechado (impressora 3D, 2 unidades)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'sethi3d',
  'Sethi3D — Impressora 3D de gabinete fechado',
  'impressora_3d',
  'Impressora 3D de grande volume com gabinete fechado.',
  'DI — Fabricação Digital',
  1440, 120, null, null
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array['SETHI-01', 'SETHI-02']) as codigo
where r.slug = 'sethi3d'
on conflict (codigo) do nothing;

-- 6. Flashforge Hunter DLP (impressora 3D de resina, 3 unidades)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'flashforge-hunter-dlp',
  'Flashforge Hunter DLP',
  'impressora_3d',
  'Impressora 3D de resina (DLP) para alta precisão e detalhes.',
  'DI — Fabricação Digital',
  1440, 120, null, null
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array['HUNTER-01', 'HUNTER-02', 'HUNTER-03']) as codigo
where r.slug = 'flashforge-hunter-dlp'
on conflict (codigo) do nothing;

-- 7. Kit Arduino (kit, 10 unidades)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'kit-arduino',
  'Kit Arduino',
  'kit',
  'Placas, sensores e módulos para prototipagem eletrônica.',
  'Senac — Laboratório de Eletrônica',
  240, 60, '08:00', '22:45'
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array[
  'ARDUINO-01', 'ARDUINO-02', 'ARDUINO-03', 'ARDUINO-04', 'ARDUINO-05',
  'ARDUINO-06', 'ARDUINO-07', 'ARDUINO-08', 'ARDUINO-09', 'ARDUINO-10'
]) as codigo
where r.slug = 'kit-arduino'
on conflict (codigo) do nothing;

-- 8. Kit de Eletrônica (kit, 10 unidades)
insert into public.resources (
  slug, nome, tipo, descricao, local,
  duracao_maxima_minutos, antecedencia_minima_minutos,
  horario_abertura, horario_fechamento
) values (
  'kit-eletronica',
  'Kit de Eletrônica',
  'kit',
  'Componentes eletrônicos e instrumentos básicos para prototipagem.',
  'Senac — Laboratório de Eletrônica',
  240, 60, '08:00', '22:45'
)
on conflict (slug) do nothing;

insert into public.resource_units (resource_id, codigo)
select r.id, codigo
from public.resources r
cross join unnest(array[
  'ELETRONICA-01', 'ELETRONICA-02', 'ELETRONICA-03', 'ELETRONICA-04', 'ELETRONICA-05',
  'ELETRONICA-06', 'ELETRONICA-07', 'ELETRONICA-08', 'ELETRONICA-09', 'ELETRONICA-10'
]) as codigo
where r.slug = 'kit-eletronica'
on conflict (codigo) do nothing;

-- 9. DI — Oficina de Fabricação e Prototipagem (espaço compartilhado, sem
-- resource_units — reforçado pelo trigger resource_units_prevent_shared_space).
insert into public.resources (
  slug, nome, tipo, descricao, local,
  antecedencia_minima_minutos, horario_abertura, horario_fechamento,
  is_shared_space, orientacoes_seguranca
) values (
  'di-oficina-fabricacao-prototipagem',
  'DI — Oficina de Fabricação e Prototipagem',
  'espaco_compartilhado',
  'Espaço compartilhado do DI com máquinas de fabricação, corte, marcenaria e prototipagem. Múltiplas pessoas podem agendar uso orientado no mesmo período — não há exclusividade nem atribuição de unidade. Há sempre técnicos/especialistas no local para auxiliar.',
  'Senac — Departamento de Inovação',
  120, '08:00', '22:45',
  true,
  array[
    'Uso de jaleco quando exigido pela atividade.',
    'Utilização de proteção ocular quando indicada.',
    'Não utilizar acessórios ou vestimentas que ofereçam risco próximo às máquinas.',
    'Seguir sempre as instruções da equipe técnica responsável.',
    'Manter o espaço de trabalho organizado durante e após o uso.',
    'Respeitar as regras específicas de cada máquina ou equipamento.'
  ]
)
on conflict (slug) do nothing;
