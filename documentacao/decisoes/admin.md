# Área administrativa — Senac ResourceHub

Documento técnico da área `/admin` (Prompt 9.1). Complementa `banco-de-dados.md` (RLS, `is_admin()`) e `autenticacao.md` (proteção de rota, role) sem duplicá-los — aqui o foco são as decisões específicas de gestão administrativa: como um usuário se torna admin, o que um admin pode e não pode fazer, e o modelo de exclusão/desativação.

## Como alguém se torna usuário

Todo cadastro público (`/cadastro`) cria um `profiles.role = 'user'` — não existe, em nenhum lugar da aplicação, um formulário ou parâmetro que permita escolher `admin` no momento do cadastro. Essa regra é reforçada no próprio banco (`handle_new_user`, ver `banco-de-dados.md`), não só na camada de aplicação.

**Não existe fila de aprovação de cadastro.** Um usuário criado por `/cadastro` já nasce ativo e utilizável (respeitada a confirmação de e-mail do Supabase Auth) — não há status "pendente", nem tela "Aprovar cadastro" em `/admin`. Isso foi confirmado explicitamente contra o documento de requisitos original do grupo antes de implementar: essa exigência não existe no escopo do projeto.

## Como o primeiro administrador foi criado

O primeiro admin do sistema não é criado por nenhum fluxo da aplicação — é um **bootstrap manual, fora do código**, feito uma única vez com um `UPDATE` direto no banco (via `db query`, nunca uma migration), sobre a conta que já existia como usuário comum. O comando localiza a conta por e-mail, confirma que existe exatamente uma correspondência antes e depois da alteração, e não deixa nenhum vestígio do e-mail usado em arquivo versionado — nem migration, nem script, nem constante na aplicação. Não é uma regra de negócio do sistema, é um procedimento operacional de implantação: qualquer ambiente novo (produção, outro projeto Supabase) repete o mesmo tipo de `UPDATE` manual para nomear seu primeiro admin.

A tela `/admin/usuarios` mantém um aviso informativo com o comando genérico de bootstrap (`UPDATE public.profiles SET role='admin' WHERE email='EMAIL_DO_ADMIN_ESCOLHIDO'`) para quem for configurar um novo ambiente — sem nenhum e-mail real embutido nele.

## Como um usuário vira administrador depois disso

A partir do segundo admin em diante, a promoção é sempre feita por um admin existente, em `/admin/usuarios`, através do botão "Tornar administrador" sobre um usuário já cadastrado. Não existe, e nunca existirá, uma tela pública de criação de conta admin. Um usuário comum não tem, em nenhuma tela, forma de alterar a própria role — isso é bloqueado tanto pela ausência de controle na UI quanto pelo banco (trigger `protect_profile_privileged_fields`).

Toda promoção/remoção de admin passa por `promoteUserAction`/`demoteUserAction` (`lib/actions/admin.ts`), que revalidam `auth.uid()` e a role de quem está chamando antes de tocar em qualquer linha — a UI (esconder botão, desabilitar campo) nunca é a única barreira.

## Regra do último administrador

O sistema nunca fica sem nenhum admin ativo. Duas rotas diferentes protegem essa invariante:

- **Remover acesso de administrador** (`demoteUserAction`): antes de rebaixar alguém, conta quantos admins ativos existem; se restar só um, a ação é bloqueada com a mensagem "É necessário manter pelo menos um administrador ativo no sistema."
- **Excluir usuário** (`admin_delete_user`, RPC no banco): a mesma contagem é feita dentro da própria função `SECURITY DEFINER`, antes de qualquer exclusão — um admin não consegue excluir a própria conta por essa tela (bloqueado already por ser sempre auto-exclusão), e não consegue excluir outro admin se isso deixasse o sistema sem nenhum.

A contagem de admins ativos é sempre recalculada na hora, dentro da mesma função/ação que faz a alteração — nunca um valor cacheado de uma leitura anterior.

## Exclusão de usuário pelo admin

`admin_delete_user(target_user_id)` é uma função `SECURITY DEFINER` no banco, só executável por quem está autenticado e é admin (`is_admin()`), que:

1. Recusa se o alvo for o próprio chamador (exclusão da própria conta só acontece por Perfil, nunca por esta tela).
2. Recusa se o alvo já estiver excluído.
3. Recusa se o alvo for o último admin ativo do sistema.
4. Cancela as reservas futuras `ATIVA` do usuário (elas passam a `CANCELADA`, preservadas no histórico).
5. Anonimiza `profiles` (nome, e-mail, telefone, curso, matrícula, etc. — mesmo padrão de soft delete que `delete_my_account()` já usava para autoexclusão) e remove a linha de `auth.users`.

O histórico de reservas nunca é apagado — apenas passa a apontar para um perfil anonimizado, do mesmo jeito que já acontecia na autoexclusão. Não existe, e não foi implementada, nenhuma forma de o admin redefinir a senha de outro usuário — está fora do escopo definido para esta etapa.

## Ações disponíveis em `/admin`

- **Recursos**: criar, editar, ativar/inativar (nunca excluir um recurso com histórico — inativar apenas bloqueia novas reservas).
- **Unidades**: criar, alterar status (Operacional/Manutenção/Inativa — nunca "Reservado", que é sempre calculado a partir das reservas ativas, nunca um campo fixo).
- **Reservas**: consultar com filtros (recurso/usuário/data/status), ver detalhes, cancelar qualquer reserva a qualquer momento (sem a regra de 48h que vale para o usuário comum).
- **Usuários**: consultar com busca/filtros, ver detalhes, editar nome, promover/remover admin, excluir (soft delete anonimizado).

Toda ação destrutiva ou sensível pede confirmação explícita antes de executar, e toda rota `/admin/**` reverifica a role no servidor (`requireAdminProfile`, em `app/(app)/admin/layout.tsx`) — esconder o item na sidebar é só conveniência visual, nunca a proteção real.
