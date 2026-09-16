# Contexto e Decisões do Projeto — Senac ResourceHub

Registro consolidado do Prompt 0. Fonte de verdade para conflitos entre o documento de requisitos original (`documentacao/requisitos/Requisitos_Grupo_Solicitante.pdf`) e as decisões arquiteturais deste projeto. Não substitui o documento original — complementa e resolve suas ambiguidades.

## 1. Conflitos entre o documento original e o Prompt 0 (e resoluções adotadas)

### 1.1 Número de telas
O documento define 3 telas principais (Login, Painel do Usuário, Gestão Admin) e pede para não criar novas telas principais. O Prompt 0 e os mockups (`documentacao/referencias/mockups/`) descrevem uma IA muito mais rica: Home, Recursos, Detalhe do Recurso, Calendário, Reserva, Confirmação, Minhas Reservas, Perfil, e uma área Admin com várias sub-telas.

**Resolução:** as "3 telas" do documento são tratadas como zonas funcionais, não contagem literal de páginas. "Painel do Usuário" = toda a área logada do aluno (Home, Recursos, Calendário, Reserva, Confirmação, Minhas Reservas, Perfil). "Gestão" = toda a área `/admin`. A IA detalhada do Prompt 0 e dos mockups é a que será implementada.

### 1.2 Edição de dados do usuário comum
Contradição interna ao próprio documento: seção 3.1 diz "Pode alterar seus próprios dados: Não"; seção 4 diz "Poderá alterar apenas Senha e Nome".

**Resolução:** segue-se a seção 4. Usuário comum edita Nome e Senha. Os campos extras vistos no mockup de Perfil (Telefone, Matrícula, Unidade/Campus, Curso) não constam no dicionário de dados original — são uma extensão de perfil aprovada por este documento. Proposta: Nome, Telefone, Unidade/Campus e Curso editáveis; E-mail e Matrícula somente leitura (E-mail é chave de login, alterá-lo exigiria reautenticação/fluxo próprio não previsto).

### 1.3 Status da reserva
O próprio documento sinaliza a inconsistência (seção 9.2): uma regra cita apenas Ativa/Cancelada, o dicionário de dados também lista "Concluída", e "Expirada" aparece descrita em RN06 sem constar formalmente no enum.

**Resolução:** "Concluída" é descartada. Persistem no banco apenas dois status: `ATIVA` e `CANCELADA`. `EXPIRADA` — junto com `FUTURA` e `EM_USO`, vistos no mockup de Minhas Reservas — é um estado **derivado**, calculado na leitura a partir de `ATIVA` comparada à data/hora atual, nunca gravado nem exigindo job/cron para transição (ver detalhamento na seção 4).

### 1.4 Modelo de Recurso × Unidade Física
O documento modela um recurso simples (Nome + Situação Ativo/Inativo) sem conceito de unidades físicas múltiplas; a regra de conflito citada é "impedir reservas simultâneas do mesmo recurso", sugerindo capacidade implícita = 1. O Prompt 0 exige o modelo de dois níveis (Resource / ResourceUnit) para equipamentos com pool de unidades (ex.: 12 osciloscópios), que é exatamente o que os mockups implementam (atribuição automática de unidade, tela de "Unidades deste recurso").

**Resolução:** adotado o modelo de dois níveis do Prompt 0. O modelo simples do documento (1 recurso = 1 uso por vez) é tratado como o caso particular de um recurso com exatamente 1 unidade física (laboratórios exclusivos). Equipamentos, impressoras e kits têm N `resource_units`. A exceção é a Oficina de Fabricação e Prototipagem: por ser espaço compartilhado sem exclusividade, **não possui `resource_unit` nenhuma** — suas reservas são criadas com `resource_unit_id = null` e não passam pela checagem de conflito/atribuição (ver seção 8).

### 1.5 Regra de cancelamento
Documento e Prompt 0 concordam: usuário cancela até 2 dias antes do início. O mockup de Calendário mostra, no card "Regras de reserva", o texto "Cancelamento: até 1 hora antes" para o Bambu Lab A1.

**Resolução:** o "1 hora" do mockup é tratado como conteúdo ilustrativo da imagem (o Prompt 0 pede para não copiar textos literais dos mockups, priorizando a intenção visual). A regra de negócio real e única é **2 dias antes**, conforme o documento de requisitos.

### 1.6 Papéis além de User/Admin
O mockup do Admin mostra rótulos "Aluno", "Instrutor", "Técnico" em "Cadastros recentes". Documento e Prompt 0 definem apenas dois papéis de acesso (`USER`, `ADMIN`).

**Resolução:** mantidos apenas dois papéis funcionais de acesso (`user`, `admin`). Os rótulos adicionais podem existir como um campo cosmético (ex.: `categoria`/`tipo_vinculo`: aluno, instrutor, técnico) sem qualquer efeito sobre permissões.

### 1.7 Rotas de redirecionamento pós-login
O documento especifica literalmente `/reservas` (User) e `/admin/dashboard` (Admin). Os mockups mostram a Home como dashboard geral, distinta da página "Recursos".

**Resolução:** User → `/` (Home/dashboard, que cumpre o papel do "Painel do Usuário" do documento). Admin → `/admin` (dashboard administrativo). A intenção da regra (redirecionar conforme Role) é preservada; o nome literal da rota `/reservas` não é seguido ao pé da letra.

## 2. Entendimento do produto

Alunos e usuários autorizados escolhem um **tipo de recurso** (não uma unidade física) e um período; o sistema atribui automaticamente uma unidade física disponível. Administradores gerenciam recursos, unidades físicas, usuários, e podem cancelar qualquer reserva. A Oficina de Fabricação e Prototipagem é um caso especial: espaço compartilhado sem exclusividade, onde múltiplas pessoas podem agendar uso orientado no mesmo horário. O produto deve ter acabamento visual de SaaS real (identidade azul/laranja, cartões arredondados, animações sutis), com um recurso (Bambu Lab A1) demonstrando 3D interativo como prova de conceito.

## 3. Arquitetura geral

- Next.js App Router, Server Components por padrão, Client Components só onde há interatividade real (formulários, calendário, 3D, animações).
- Server Actions para todas as mutações (criar reserva, cancelar, cadastrar recurso), mantendo a lógica de conflito e atribuição de unidade no servidor, dentro de transação.
- Supabase Postgres como fonte única de verdade; controle de acesso via RLS (usuário só lê/edita as próprias reservas e dados; admin tem policies mais amplas via claim de role no JWT).
- Atribuição de unidade física feita em transação com lock (`FOR UPDATE SKIP LOCKED` ou exclusion constraint com `tstzrange`) para evitar condição de corrida quando duas pessoas disputam a última unidade livre.
- Deploy: Vercel (app) + Supabase Cloud (banco/auth). Nenhuma dependência de máquina local ligada após o deploy.

## 4. Modelo lógico inicial (conceitual — sem SQL nesta etapa)

- **profiles**: id, nome, email, role (`user`|`admin`), telefone, curso, unidade_campus, matricula, categoria (cosmético), status (`active`|`deleted`), created_at. Sincronizado com `auth.users` via trigger no cadastro, mas **sem FK `on delete cascade`** (ver seção 7).
- **resources**: id, slug, nome, tipo (`laboratorio`|`equipamento`|`impressora_3d`|`kit`|`espaco_compartilhado`), descrição, local, imagens[], modelo_3d_url (nullable), regras (duração máxima, antecedência mínima, horário de funcionamento), orientacoes_seguranca (nullable, usado pela Oficina), is_shared_space (bool), ativo (bool).
- **resource_units**: id, resource_id (FK), codigo (ex.: `OSC-04`), status (`disponivel`|`manutencao`|`inativa`). Existe para todo recurso, exceto a Oficina de Fabricação e Prototipagem (espaço compartilhado, sem `resource_unit`).
- **reservations**: id, user_id (FK profiles), resource_id (FK), resource_unit_id (FK, nullable — sempre `null` para reservas da Oficina, preenchido para todos os demais recursos), data_hora_inicio, data_hora_fim, finalidade, observacoes, status (`ATIVA`|`CANCELADA`, apenas estes dois persistidos), cancelado_em, cancelado_por.

**Estados derivados (não persistidos):** a aplicação nunca grava `EXPIRADA`. Em tela, uma reserva `ATIVA` é apresentada como `FUTURA` (início > agora), `EM_USO` (início ≤ agora < fim) ou `EXPIRADA` (fim ≤ agora), calculado a cada leitura. Isso elimina a necessidade de job/cron para transição de status — problema citado como risco no Prompt 0 e removido nesta correção.

## 5. Rotas/telas esperadas

**Públicas:** `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`

**Usuário autenticado:** `/` (Home), `/recursos`, `/recursos/[slug]`, `/recursos/[slug]/calendario`, `/reservas/nova` (wizard: recurso → horário → dados complementares → confirmar), `/reservas/[id]/confirmacao`, `/minhas-reservas`, `/minhas-reservas/[id]`, `/perfil` (abas: dados pessoais, segurança, preferências, conta)

**Admin** (guard de role no servidor): `/admin`, `/admin/recursos`, `/admin/recursos/novo`, `/admin/recursos/[id]`, `/admin/unidades`, `/admin/reservas`, `/admin/usuarios`, `/admin/usuarios/[id]`

**Estados obrigatórios:** not-found, error boundary, loading por rota, empty states ("sem reservas", "sem resultados"), modais de confirmação (cancelar reserva, excluir conta).

## 6. Principais regras de negócio

- RN01–RN07 do documento: e-mail/senha obrigatórios e validados antes do envio; sessão válida existente pula a tela de login; período conflitante com reserva existente do mesmo recurso impede a criação; reserva expira automaticamente quando o horário final é atingido — na prática, ela continua `ATIVA` no banco e passa a ser apresentada como `EXPIRADA` (estado derivado, ver seção 4), deixando de aparecer em "Minhas Reservas Ativas" mas permanecendo no histórico; reserva cancelada some da disponibilidade mas permanece registrada com status `CANCELADA`.
- Nenhuma reserva no passado; horário fim deve ser estritamente maior que o início.
- Unidade em manutenção ou inativa nunca é atribuída a uma nova reserva.
- Basta 1 unidade livre no período para permitir a reserva do recurso; se todas as unidades estão ocupadas, o sistema informa indisponibilidade.
- Reservas encostadas são permitidas (fim de uma = início de outra não é sobreposição).
- Cancelamento: usuário comum até 2 dias antes do início; administrador a qualquer momento; sempre com confirmação explícita antes de efetivar.
- Oficina de Fabricação e Prototipagem não aplica checagem de conflito/exclusividade — múltiplos agendamentos de uso orientado no mesmo período são permitidos.
- E-mail único (mensagem: "E-mail já cadastrado. Utilize outro e-mail."); senha mínima de 8 caracteres; nome até 100 caracteres, obrigatório, não pode ser só espaços.
- Rotas administrativas exigem checagem de role no servidor — nunca apenas ocultar o link na interface.

## 7. Maiores riscos técnicos

1. **Condição de corrida na atribuição automática de unidade** — dois usuários reservando a última unidade livre ao mesmo tempo. Mitigação: transação com lock/skip-locked ou exclusion constraint via `tstzrange` no Postgres.
2. ~~Expiração automática sem servidor sempre ligado~~ — **eliminado nesta correção.** `EXPIRADA` não é um status persistido; é sempre calculado na leitura comparando `ATIVA` + `data_hora_fim` com o instante atual. Não há dependência de job/cron para essa transição.
3. **RLS complexa** para dois papéis com regras diferentes por tabela — exige testes deliberados (Supabase CLI local na próxima etapa).
4. **Exclusão de conta vs. integridade referencial** das reservas — ver estratégia na seção 8.
5. **Fuso horário** — armazenar sempre em `timestamptz` (UTC); converter para `America/Sao_Paulo` só na camada de apresentação.
6. **Performance do 3D** — bundle do Three.js/React Three Fiber deve ser code-split (`next/dynamic`, `ssr:false`) e ter fallback robusto para falha de carregamento, dispositivos fracos ou `prefers-reduced-motion`.

## 8. Confirmações pontuais pedidas no Prompt 0

**Recurso × Unidade:** modelo de dois níveis (`resources` / `resource_units`) para laboratórios exclusivos (1 unidade), equipamentos, impressoras e kits (N unidades). Atribuição automática ocorre no servidor, dentro de transação, nunca escolhida pelo usuário. A Oficina de Fabricação e Prototipagem é a única exceção e **não possui `resource_unit`**.

**Oficina de Fabricação e Prototipagem:** modelada como `resources.tipo = 'espaco_compartilhado'` (ou flag `is_shared_space`), sem nenhuma `resource_unit` associada. Suas reservas são criadas com `resource_unit_id = null` e não passam por checagem de conflito/exclusividade nem por atribuição automática de unidade. Usuários registram período e objetivo via "Agendar uso orientado". Orientações de segurança ficam associadas ao próprio recurso e são exibidas na tela de detalhe/reserva.

**Exclusão de conta:** soft delete. `profiles` não tem FK `on delete cascade` para `auth.users` (sincronizada por trigger apenas no cadastro). Ao excluir: (1) anonimiza nome/e-mail em `profiles` e marca `status='deleted'`; (2) remove as credenciais via Supabase Admin API (`auth.admin.deleteUser`), executado só no servidor; (3) a linha de `profiles` permanece como registro histórico, preservando a integridade de `reservations.user_id`; (4) encerra a sessão e redireciona para `/login`. Fluxo de confirmação: Perfil → Conta → Excluir minha conta → aviso de ação permanente → confirmação (reautenticação de senha) → exclusão → logout → `/login`.

**Estratégia 3D:** React Three Fiber + drei, aplicado primeiro apenas ao **Bambu Lab A1** (nome sempre "Bambu Lab A1", nunca "Bambu Lab A1 Combo") na tela de detalhe do recurso (rotação, zoom, hover). Carregado via `next/dynamic({ssr:false})`, com fallback automático para carrossel de fotos — que já é necessário como apresentação padrão dos demais recursos. Se a prova de conceito funcionar bem, o padrão poderá ser replicado para Osciloscópio, Sethi3D e Flashforge Hunter DLP em etapa futura.

## 9. Recursos iniciais (catálogo semente, a popular via `supabase/seed.sql` na etapa de Supabase)

| Recurso | Tipo | Unidades | Códigos sugeridos |
|---|---|---|---|
| DI — Laboratório de Hardware | Laboratório | 1 | DI-HW-01 |
| DI — Laboratório de Redes | Laboratório | 1 | DI-REDES-01 |
| Osciloscópio | Equipamento | 12 | OSC-01 … OSC-12 |
| Bambu Lab A1 | Impressora 3D | 3 | BAMBU-A1-01 … 03 |
| Sethi3D | Impressora 3D (gabinete fechado) | 2 | SETHI-01, SETHI-02 |
| Flashforge Hunter DLP | Impressora 3D (resina/DLP) | 3 | HUNTER-01 … 03 |
| Kit Arduino | Kit | ~10 | ARDUINO-01 … 10 |
| Kit de Eletrônica | Kit | ~10 | ELETRONICA-01 … 10 |
| DI — Oficina de Fabricação e Prototipagem | Espaço compartilhado | — (sem exclusividade) | — |

## 10. Escopo explicitamente fora deste prompt

Nenhum código, dependência, inicialização de Next.js, configuração de Supabase ou deploy foi feito nesta etapa — apenas leitura, análise e registro de decisões, conforme instruído.
