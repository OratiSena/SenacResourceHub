# Senac ResourceHub

Sistema de Reservas de Laboratórios e Equipamentos do Centro Universitário Senac. Projeto acadêmico da disciplina Engenharia de Software II.

## Objetivo

Permitir que alunos e usuários autorizados consultem a disponibilidade e reservem laboratórios, equipamentos e espaços acadêmicos do Senac, com atribuição automática de unidade física dentro do tipo de recurso escolhido.

O projeto foi desenvolvido em um prazo acadêmico reduzido, de aproximadamente uma semana, com uso significativo de Inteligência Artificial como apoio ao processo de desenvolvimento, organização, validação e aceleração da implementação.

## Funcionalidades

- Cadastro e login
- Confirmação de e-mail
- Recuperação de senha
- Catálogo de recursos (laboratórios, equipamentos, impressoras 3D, kits e espaço compartilhado)
- Visualizações 3D interativas por recurso
- Consulta de disponibilidade em calendário
- Reservas com atribuição automática de unidade física
- Oficina de Fabricação e Prototipagem (espaço compartilhado, uso orientado)
- Minhas Reservas
- Perfil (dados pessoais, senha, exclusão de conta)
- Notificações (reservas próprias e, para administradores, atividade administrativa)
- Área administrativa completa (dashboard, recursos, unidades, reservas, usuários)

## Tecnologias

- Next.js
- React
- TypeScript
- Supabase
- PostgreSQL
- Tailwind CSS
- Three.js / React Three Fiber
- Vercel

## Perfis

- **User** — reserva recursos, gerencia as próprias reservas e o próprio perfil.
- **Admin** — tudo o que um User faz, além de gerenciar recursos, unidades, reservas de qualquer usuário e outros usuários.

Todo cadastro público cria automaticamente um usuário `User` — não existe seleção de perfil no cadastro. Um Admin promove um `User` existente a `Admin` em `/admin/usuarios`; o primeiro Admin do sistema é configurado manualmente no banco (ver `documentacao/decisoes/admin.md`).

## Requisitos para executar

- Node.js 20 ou superior
- npm
- Um projeto Supabase (URL + publishable key)

## Como instalar

```bash
npm install
```

Copie `.env.example` para `.env.local` e preencha os valores do seu projeto Supabase.

## Como iniciar o desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Como gerar build de produção

```bash
npm run build
npm run start
```

## Estrutura resumida do projeto

```
app/                  rotas e páginas (App Router)
components/           componentes de UI compartilhados
lib/                  utilitários, camada de dados e lógica compartilhada
public/
  imagens/            imagens estáticas
supabase/
  migrations/         schema versionado do banco
documentacao/
  requisitos/         documento original de requisitos
  referencias/         mockups de referência visual
  decisoes/            decisões arquiteturais consolidadas
```

## Deploy

Produção: https://senac-resource-hub.vercel.app

Banco de dados e autenticação: Supabase Cloud.
