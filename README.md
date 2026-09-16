# Senac ResourceHub

Sistema de Reservas de Laboratórios e Equipamentos do Centro Universitário Senac. Projeto acadêmico da disciplina Engenharia de Software II.

## Objetivo

Permitir que alunos e usuários autorizados consultem a disponibilidade e reservem laboratórios, equipamentos e espaços acadêmicos do Senac, com atribuição automática de unidade física dentro do tipo de recurso escolhido.

O projeto foi desenvolvido em um prazo acadêmico reduzido, de aproximadamente uma semana, com solicitação de uso de ferramentas de Inteligência Artificial como apoio ao processo de desenvolvimento, organização, validação e aceleração da implementação.

## Stack atual

- [Next.js](https://nextjs.org/) (App Router) + TypeScript + React
- Tailwind CSS
- ESLint

Supabase (banco de dados e autenticação), design system definitivo, animações e 3D serão adicionados em etapas futuras — ver `CLAUDE.md` e `documentacao/decisoes/contexto-projeto.md`.

## Requisitos para executar

- Node.js 20 ou superior
- npm

## Como instalar

```bash
npm install
```

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
lib/                  utilitários e lógica compartilhada
public/
  imagens/            imagens estáticas
  modelos3d/          modelos 3D dos recursos
documentacao/
  requisitos/         documento original de requisitos
  referencias/         mockups de referência visual
  decisoes/            decisões arquiteturais consolidadas
scripts/              scripts utilitários do projeto
```

## Próximos passos

Supabase, autenticação, banco de dados e deploy ainda não foram configurados — serão implementados nos próximos prompts, conforme registrado em `CLAUDE.md`.
