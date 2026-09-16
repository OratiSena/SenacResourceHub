# Banco de Dados — Senac ResourceHub

Documento técnico da implementação em `supabase/migrations/`. Complementa `documentacao/decisoes/contexto-projeto.md` (que registra as decisões de produto) sem duplicá-lo — aqui o foco é como o schema foi efetivamente implementado.

## Entidades e relacionamentos

```
auth.users (gerenciado pelo Supabase Auth)
    │  trigger on_auth_user_created (1x, na criação)
    ▼
public.profiles ──┐
                   │ user_id (restrict)
public.resources ──┼── public.reservations
    │ resource_id (restrict)
    ▼
public.resource_units ── resource_unit_id (restrict, nullable)
```

- **profiles**: 1 linha por usuário de aplicação. `id` **não** é uma foreign key para `auth.users(id)` — ver "Estratégia de exclusão de conta" abaixo.
- **resources**: o tipo de recurso reservável (ex.: "Osciloscópio"). O usuário reserva um `resource`, nunca uma unidade específica.
- **resource_units**: cada equipamento físico individual (ex.: `OSC-04`). Toda `resource` tem N `resource_units`, exceto recursos `tipo = 'espaco_compartilhado'` (a Oficina), que não têm nenhuma — reforçado por trigger, não só por convenção do seed.
- **reservations**: uma reserva de um `resource` (com `resource_unit` atribuída automaticamente) por um `profile`, em um período. `resource_unit_id` é obrigatório para recursos normais e sempre `null` para espaço compartilhado — também reforçado por trigger.

Todas as FKs de `reservations` (`user_id`, `resource_id`, `resource_unit_id`, `cancelado_por`) usam `on delete restrict`: nada que tenha reservas associadas pode ser apagado. A desativação é sempre feita por flag (`resources.ativo`, `resource_units.status`), nunca por exclusão física — assim o histórico nunca quebra.

## Estratégia de identificação de admin

`public.is_admin()` é uma função `security definer`, `stable`, que verifica `profiles.role = 'admin' and profiles.status = 'active'` para `auth.uid()`. Ela é a base de toda autorização administrativa:

- É `security definer` para evitar o problema clássico de recursão de RLS (uma policy de `profiles` que precisasse consultar `profiles` para se avaliar).
- É usada tanto nas políticas de RLS quanto no trigger `protect_profile_privileged_fields`.
- Verifica `status = 'active'` como proteção extra: um admin com a conta em processo de soft delete não retém privilégios administrativos.

**Um usuário comum nunca pode se promover a admin.** Isso é garantido em duas camadas independentes:
1. O trigger `on_auth_user_created` sempre cria o profile com `role = 'user'`, não importa o que o cliente envie no cadastro.
2. O trigger `protect_profile_privileged_fields` (em todo `UPDATE` de `profiles`) força `role` e `status` de volta ao valor anterior, a menos que quem está executando o `UPDATE` já seja admin — independentemente do que a política de RLS permitiria.

Não existe fluxo de auto-promoção. O primeiro administrador do sistema precisa ser criado manualmente (uma vez) via SQL Editor do Supabase ou pela `service_role` key, com um `UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>'`. A partir daí, admins podem promover outros usuários pela mesma via (`is_admin()` libera o `UPDATE` de `role` para eles), o que será exposto na área administrativa em prompt futuro.

## Atribuição automática de unidade (sem condição de corrida)

Esta é a regra mais sensível do projeto (Prompt 2, seção 7). A solução combina duas técnicas complementares em `public.create_reservation()`:

1. **Exclusion constraint** (`reservations_no_overlap`, usando a extensão `btree_gist`): impede, a nível do próprio Postgres, que duas linhas de `reservations` com o mesmo `resource_unit_id` tenham intervalos `tstzrange` sobrepostos, considerando apenas `status = 'ATIVA'`. Isso é avaliado atomicamente no momento do `INSERT`/`UPDATE`, dentro da transação — **é isto que efetivamente impede a condição de corrida**, não uma checagem de aplicação.
2. **`FOR UPDATE SKIP LOCKED`** ao listar as `resource_units` candidatas (`status = 'disponivel'`, ordenadas por `codigo`): é uma otimização de contenção, não de correção — reduz a chance de duas transações concorrentes disputarem a mesma unidade como primeira tentativa, mas não é o que garante a ausência de sobreposição.

Fluxo da função:
1. Valida autenticação, período (fim > início, início não pode ser passado) e que o recurso existe e está ativo.
2. Se `resources.is_shared_space = true` (a Oficina): insere a reserva direto, com `resource_unit_id = null`, sem nenhuma checagem de conflito.
3. Caso contrário: itera as unidades `disponivel` do recurso (travadas com `SKIP LOCKED`) e tenta inserir a reserva em cada uma, em ordem. Se o `INSERT` falhar com `exclusion_violation` (SQLSTATE `23P01` — a unidade já tem uma reserva `ATIVA` sobreposta, descoberta só agora porque foi confirmada por outra transação), tenta a próxima candidata. Se nenhuma candidata funcionar, levanta `'Nenhuma unidade disponivel para o periodo informado'`.

Por isso a fundação de banco **não** depende de "`SELECT` unidade livre e depois `INSERT`" como duas operações independentes (proibido explicitamente no Prompt 2): a decisão real de "esta unidade está livre" só é confirmada pelo próprio `INSERT`, avaliado pela exclusion constraint.

O limite do `tstzrange` usado é `'[)'` (início inclusivo, fim exclusivo), o que faz reservas encostadas serem aceitas: `[10:00, 12:00)` e `[12:00, 14:00)` não se sobrepõem.

`reservations` não tem política de `INSERT`/`UPDATE` para usuários comuns — a única via de criação é `create_reservation()` e a única via de cancelamento é `cancel_reservation()` (ambas `security definer`, expostas via `GRANT EXECUTE` apenas para `authenticated`). Isso torna estrutural, não apenas convencional, que toda reserva passe pela lógica atômica.

`cancel_reservation()` implementa a regra de cancelamento já documentada: usuário comum só cancela a própria reserva e só até 2 dias antes do início; admin cancela qualquer reserva a qualquer momento.

## RLS — resumo por tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | própria linha, ou tudo se admin | ninguém (só o trigger de signup) | própria linha (campos não sensíveis) ou tudo se admin; `role`/`status` travados por trigger fora de admin | ninguém |
| `resources` | ativos para todos, tudo se admin | admin | admin | admin (bloqueado na prática por FK `restrict` se houver unidades) |
| `resource_units` | unidades de recursos ativos, tudo se admin | admin | admin | admin (bloqueado na prática por FK `restrict` se houver reservas) |
| `reservations` | próprias reservas, ou tudo se admin | admin (usuário comum só via `create_reservation`) | admin (usuário comum só via `cancel_reservation`) | ninguém |

RLS está habilitada (`enable row level security`) em todas as quatro tabelas. Nenhuma política depende de esconder elementos na interface — o banco recusa o acesso independentemente do que o frontend mostra ou esconde.

## Oficina de Fabricação e Prototipagem (espaço compartilhado)

Modelada como `resources.tipo = 'espaco_compartilhado'` com `is_shared_space = true` (um `CHECK constraint` mantém os dois campos sempre consistentes). Dois triggers reforçam a regra em nível de banco, não apenas de aplicação:

- `resource_units_prevent_shared_space`: impede inserir/atualizar uma `resource_unit` apontando para um recurso de espaço compartilhado.
- `reservations_validate_unit_assignment`: impede que uma reserva de espaço compartilhado tenha `resource_unit_id` preenchido, e exige `resource_unit_id` preenchido para todos os outros tipos.

A exclusion constraint de sobreposição só se aplica `where resource_unit_id is not null`, então reservas da Oficina (sempre com `resource_unit_id = null`) nunca competem entre si — múltiplos agendamentos de uso orientado no mesmo período são permitidos por construção.

## Soft delete de conta

`profiles.id` **não tem foreign key para `auth.users(id)`.** Isso é intencional: em Postgres, uma FK só permite `CASCADE`, `SET NULL`/`SET DEFAULT` ou `RESTRICT` quando o pai é apagado — não existe uma opção de "apagar o pai e deixar o filho como está". Como a estratégia de exclusão de conta exige remover as credenciais em `auth.users` (via Admin API, ação exclusiva de servidor) **preservando** a linha de `profiles` (anonimizada, `status = 'deleted'`) para não quebrar `reservations.user_id`, a única forma correta é não ter essa constraint. A integridade é garantida de outra forma: o único caminho que cria linhas em `profiles` é o trigger `on_auth_user_created`, então na prática todo `profiles.id` corresponde a um `auth.users.id` real no momento da criação — a divergência só passa a existir, de forma proposital, depois que uma conta é excluída.

A implementação do fluxo de exclusão (chamada à Admin API, anonimização, tela de confirmação) fica para a etapa de autenticação — aqui apenas o modelo de dados foi preparado para suportá-la corretamente.

## Fuso horário

Todas as colunas de data/hora são `timestamptz`, armazenadas em UTC pelo Postgres. A conversão para `America/Sao_Paulo` é responsabilidade exclusiva da camada de apresentação (frontend), nunca do banco.

## Migrations e seed

- `supabase/migrations/`: sete migrations, aplicadas em ordem pelo timestamp do nome do arquivo:
  1. `..._extensions_and_enums.sql` — extensões (`pgcrypto`, `btree_gist`) e enums.
  2. `..._profiles.sql` — tabela, `is_admin()`, trigger de proteção, RLS.
  3. `..._handle_new_user.sql` — trigger de criação automática de profile.
  4. `..._resources.sql` — tabela, índices, RLS.
  5. `..._resource_units.sql` — tabela, trigger anti-Oficina, RLS.
  6. `..._reservations.sql` — tabela, exclusion constraint anti-sobreposição, trigger de validação de unidade, RLS.
  7. `..._reservation_functions.sql` — `create_reservation()` e `cancel_reservation()`.
- `supabase/seed.sql`: popula os 9 recursos iniciais e as 42 `resource_units` correspondentes (ver seção 9 de `contexto-projeto.md`). Todo `INSERT` usa `ON CONFLICT ... DO NOTHING`, então o arquivo é idempotente e seguro para reexecutar em `supabase db reset`. Não cria usuários em `auth.users` nem senhas — dados de demonstração de usuários ficam para a etapa de autenticação.
- Fluxo local esperado (requer Docker/Podman, ver limitação registrada no relatório do Prompt 2): `npx supabase start` → `npx supabase db reset` (aplica migrations + seed do zero) → `npx supabase gen types typescript --local > lib/supabase/database.types.ts`.
- Fluxo remoto esperado (requer login prévio via `npx supabase login`): `npx supabase link --project-ref <ref>` → `npx supabase db push` (aplica migrations) → aplicar seed manualmente se apropriado para o ambiente de dev/acadêmico → `npx supabase gen types typescript --linked > lib/supabase/database.types.ts`.
