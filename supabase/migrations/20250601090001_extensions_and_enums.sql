-- Extensões e enums de base do Senac ResourceHub.
-- gen_random_uuid() já vem disponível via pgcrypto nos projetos Supabase, mas é
-- declarado explicitamente para que este schema seja reproduzível em qualquer
-- Postgres 15+ compatível.
create extension if not exists pgcrypto;

-- btree_gist é necessário para a exclusion constraint que impede sobreposição
-- de reservas (ver 20250601090006_reservations.sql). Sem esta extensão não é
-- possível combinar igualdade (resource_unit_id) com sobreposição de faixa
-- (tstzrange) em uma única constraint de exclusão.
create extension if not exists btree_gist;

-- Papel de acesso do usuário. Apenas dois valores funcionais existem no
-- sistema — ver documentacao/decisoes/contexto-projeto.md, seção 1.6.
create type public.user_role as enum ('user', 'admin');

-- Estado do cadastro do usuário. 'deleted' é usado pela estratégia de soft
-- delete (perfil anonimizado, mas preservado para não quebrar o histórico de
-- reservations) — ver documentacao/decisoes/contexto-projeto.md, seção 8.
create type public.profile_status as enum ('active', 'deleted');

-- Tipos de recurso reservável.
create type public.resource_type as enum (
  'laboratorio',
  'equipamento',
  'impressora_3d',
  'kit',
  'espaco_compartilhado'
);

-- Status administrativo de uma unidade física. Não existe o valor "reservado"
-- aqui de propósito: se uma unidade está ocupada em determinado período é algo
-- calculado a partir das reservations ATIVAs sobrepostas, nunca um campo fixo.
create type public.unit_status as enum ('disponivel', 'manutencao', 'inativa');

-- Status persistido da reserva. FUTURA/EM_USO/EXPIRADA são derivados na leitura
-- comparando ATIVA + datas com o instante atual — nunca gravados no banco.
create type public.reservation_status as enum ('ATIVA', 'CANCELADA');
