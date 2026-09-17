# Modelos 3D — Senac ResourceHub

Registro do primeiro piloto de 3D interativo (Prompt 6). Complementa `documentacao/decisoes/contexto-projeto.md` (que já previa este piloto no Bambu Lab A1) sem duplicá-lo.

## Bambu Lab A1

| Item | Valor |
|---|---|
| Recurso | Bambu Lab A1 (`bambu-lab-a1`) — nome sempre exato, nunca "Combo" |
| Arquivo | Nenhum — geometria procedural em `components/3d/models/bambu-lab-a1-model.tsx` |
| Origem | Não é um asset externo. Construído com primitivas do Three.js (`boxGeometry`, `cylinderGeometry`, `coneGeometry`) |
| Licença | Não aplicável — código próprio do projeto, sem dependência de asset de terceiros |
| Tamanho | ~0 KB de asset (é código, não um arquivo binário GLB/GLTF) |
| `resources.modelo_3d_url` | Permanece `null` (correto para modelo procedural, ver Prompt 6 seção 10) |

**Por que procedural em vez de um GLB real:** o Prompt 6 pedia para não bloquear a etapa caso um modelo GLB/GLTF legalmente utilizável não fosse encontrado rapidamente ("prazo é prioridade"), autorizando explicitamente uma representação simplificada por primitivas nesse caso. Optei por ir direto ao caminho procedural — sem gastar tempo avaliando licenças de assets de terceiros — porque essa alternativa já estava pré-aprovada e elimina qualquer risco de licenciamento, tamanho de repositório ou dependência de fonte externa.

**O que a representação mostra:** mesa de impressão, torre traseira com tela (aceso em azul), viga superior em balanço (característica do design cantilever da A1), cabeçote de impressão com bico laranja, e dois carretéis de filamento coloridos (referência ao sistema AMS). Não é um modelo CAD oficial do fabricante — isso é declarado tanto visualmente (texto abaixo do preview) quanto para leitores de tela (`aria-label`/texto `sr-only`).

**Se um GLB real for adicionado no futuro:** basta (1) colocar o arquivo em `public/modelos3d/`, (2) trocar a entrada do Bambu Lab A1 em `components/3d/models/registry.ts` para um componente que usa `useGLTF` do drei (o `<Suspense>` já está preparado no viewer para isso) e (3) opcionalmente popular `resources.modelo_3d_url` via uma migration/seed versionada — nunca editar o dado direto no Dashboard.

## Arquitetura

```
components/3d/
  resource-3d-viewer-loader.tsx   Client Component com dynamic(..., { ssr: false })
  resource-3d-viewer.tsx          Canvas, câmera, luzes, OrbitControls
  model-error-boundary.tsx        Error boundary React dedicado à cena 3D
  viewer-3d-fallback.tsx          Estado único para loading/sem-WebGL/erro
  models/
    bambu-lab-a1-model.tsx        Geometria da Bambu Lab A1
    registry.ts                   slug -> componente do modelo
```

`ssr: false` só é permitido a partir de um Client Component no App Router — por isso o loader existe separado do viewer: a página de detalhe (Server Component) importa o loader, que faz o dynamic import de verdade. Isso garante que `three`/`@react-three/fiber`/`@react-three/drei` nunca entram no bundle de nenhuma outra rota (Home, catálogo, etc.) — confirmado no build: o chunk que contém código do Three.js só é referenciado pelo `react-loadable-manifest` de `/recursos/[slug]`, nenhuma outra rota.

## Fallback

Três estados cobertos pelo mesmo componente (`Viewer3DFallback`), nunca uma tela em branco:
- **Carregando**: enquanto o chunk do Three.js ainda está sendo baixado (via `<Suspense>` no loader).
- **Sem suporte a WebGL**: usa o prop nativo `fallback` do `<Canvas>` do react-three-fiber (equivalente ao `alt` de uma `<img>`).
- **Erro de render**: `ModelErrorBoundary` (error boundary React) captura qualquer exceção dentro da cena.

## Performance

- Nenhum Canvas é criado nos cards do catálogo/Home — só na página de detalhe, e só quando o recurso tem modelo 3D registrado (`RESOURCE_3D_MODELS`).
- `dpr={[1, 1.5]}` limita a densidade de pixels renderizada (evita custo desnecessário em telas retina/4K).
- Sem `<Environment>` do drei: evitado de propósito para não depender de um HDR hospedado externamente a cada carregamento da página — a iluminação usa apenas luzes Three.js nativas (ambient + 2 directional), sem fetch de rede.
- `OrbitControls` limitado (`enablePan={false}`, `minDistance`/`maxDistance`, `minPolarAngle`/`maxPolarAngle`) para impedir navegação caótica.

## Packages instalados

`three@0.186.0`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8`, `@types/three@0.186.0` (dev) — versões conferidas como compatíveis com React 19.2 e Next.js 16 antes da instalação (peer dependencies verificadas via `npm view`).
