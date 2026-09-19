# Modelos 3D e mídia visual — Senac ResourceHub

Registro do piloto de 3D interativo (Prompt 6) e da expansão para todos os 9
recursos + refinamento visual dos cards (Prompt 6.2). Complementa
`documentacao/decisoes/contexto-projeto.md` sem duplicá-lo.

## Visão geral (Prompt 6.2)

- **Cards (Home/Recursos)**: continuam 100% estáticos — nenhum `<Canvas>`
  fora da página de detalhe. Prioridade de mídia em
  `components/common/resource-media-placeholder.tsx`: (1) foto real
  licenciada (`RESOURCE_PHOTOS`), (2) ilustração SVG própria
  (`RESOURCE_ILLUSTRATIONS`), (3) ícone genérico por tipo.
- **Página de detalhe**: todos os 9 recursos agora têm uma cena 3D própria em
  `components/3d/models/` (antes só a Bambu Lab A1). Um único `<Canvas>` por
  página, carregado sob demanda (`ssr:false`).

## Fotos reais de produto (cards)

Baixadas localmente para `public/imagens/` a partir do Wikimedia Commons —
nunca hotlinkadas — e otimizadas (redimensionadas/comprimidas) com `sharp`
(dependência já presente via Next.js, usada só localmente neste passo, não
adicionada ao projeto). Registro completo em
`lib/resources/resource-photos.ts`.

| Recurso | Arquivo | Fonte | Autor | Licença |
|---|---|---|---|---|
| Kit Arduino | `public/imagens/kit-arduino.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Arduino_Uno_-_R3.jpg) | SparkFun Electronics | CC BY 2.0 |
| Osciloscópio | `public/imagens/osciloscopio.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Agilent_Technologies_DSO6052A_Oscilloscope.jpg) | transcript (Flickr) | CC BY 2.0 |
| Kit de Eletrônica | `public/imagens/kit-eletronica.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:400_points_breadboard.jpg) | oomlout | CC BY-SA 2.0 |

**Por que só esses 3:** são equipamentos genéricos (não uma marca/modelo
específico), então uma foto de estoque licenciada representa fielmente o que
o usuário vai encontrar. Bambu Lab A1, Flashforge Hunter DLP e Sethi3D são
produtos de marca específica — não há como garantir com segurança em poucos
minutos de pesquisa que uma foto de terceiros retrata exatamente o modelo do
catálogo com licença de reuso clara (a maior parte do que existe é conteúdo
de fabricante, sem licença aberta, ou fotos de usuários sem licença
explícita). Os 3 laboratórios/Oficina nunca usam foto (instrução explícita do
Prompt 6.2: não fingir que é a sala real do Senac) — usam ilustração
isométrica própria + cena 3D própria.

**Atribuição:** exibida na página de detalhe sempre que a foto realmente for
renderizada ali (hoje não acontece, porque os 3 recursos com foto também têm
modelo 3D — a foto só aparece nos cards). Documentada aqui para
conformidade com CC BY / CC BY-SA. Antes de um deploy público, considerar
adicionar uma página de créditos visível (`/creditos` ou rodapé) linkando
esta tabela.

## Ilustrações SVG (fallback dos cards quando não há foto)

`components/common/resource-illustrations.tsx` — 9 ilustrações próprias
(SVG inline, sem asset binário), criadas no Prompt 6.1 e refinadas no Prompt
6.2:

- **Laboratório de Hardware, Laboratório de Redes, Oficina**: reconstruídas
  como pequenas cenas isométricas (helper `IsoBox`, projeção dimétrica 2:1)
  em vez de um único ícone plano — bancada + monitor/torre, rack + notebook,
  bancada + máquina + sinalização de segurança, respectivamente.
- **Bambu Lab A1, Flashforge Hunter DLP, Sethi3D**: mantidas (já eram
  ilustrações bespoke, não genéricas), com uma sombra elíptica sutil
  adicionada para dar mais profundidade/consistência com as novas cenas
  isométricas.

## Modelos 3D (página de detalhe) — todos procedurais

| Recurso | Arquivo | Descrição |
|---|---|---|
| Bambu Lab A1 | `models/bambu-lab-a1-model.tsx` | Reconstruído no Prompt 6.2: chassi cantilever (coluna Z só à direita), base, mesa, painel traseiro com tela, gantry com correia, cabeçote com ventoinha, carretéis externos |
| Flashforge Hunter DLP | `models/flashforge-hunter-model.tsx` | Gabinete fechado, janela frontal escurecida (proteção UV), plataforma suspensa, vat de resina, painel de controle |
| Sethi3D | `models/sethi3d-model.tsx` | Gabinete fechado maior, porta semitransparente, gantry/mesa FDM visível por dentro — diferenciado do Hunter por ser mais alto/robusto |
| Osciloscópio | `models/osciloscopio-model.tsx` | Corpo de bancada, tela com traço de forma de onda emissivo, knobs, conectores BNC |
| Kit Arduino | `models/kit-arduino-model.tsx` | Placa verde estilo Arduino Uno: chip, USB, barrel jack, botão de reset, headers de pino |
| Kit de Eletrônica | `models/kit-eletronica-model.tsx` | Protoboard com trilhos de alimentação, LED, resistores, jumpers |
| DI — Laboratório de Hardware | `models/di-laboratorio-hardware-model.tsx` | Cena: bancada, monitor, torre, teclado, multímetro |
| DI — Laboratório de Redes | `models/di-laboratorio-redes-model.tsx` | Cena: rack com LEDs de porta, bancada, notebook, cabos de rede |
| DI — Oficina de Fabricação e Prototipagem | `models/di-oficina-model.tsx` | Cena: bancada robusta, morsa, máquina de bancada genérica, painel de ferramentas, sinalização de segurança |

Todos feitos só com primitivas do Three.js/drei (`boxGeometry`,
`cylinderGeometry`, `coneGeometry`, `RoundedBox`) — **nenhum é um modelo
CAD oficial do fabricante nem uma reprodução exata de um ambiente real**.
Peças pequenas reaproveitadas entre modelos (LED, plano emissivo, cabo em
arco) ficam em `models/primitives.tsx`.

**Por que procedural em vez de GLB real, mesmo com mais tempo disponível:**
pesquisa rápida (Sketchfab) encontrou vários modelos de Bambu Lab A1, mas
cada um exige verificação individual de licença (a maioria é licença padrão
do Sketchfab — não redistribuível — não CC0/CC-BY) e download autenticado
(sem URL pública direta), o que não é seguro de automatizar em minutos. Sem
uma fonte com licença clara e verificável, a escolha responsável — e a que o
Prompt 6.2 explicitamente autoriza como fallback — é o procedural.

## Câmera por recurso

Antes (Prompt 6): câmera fixa única para o único modelo existente. Agora
`components/3d/models/registry.ts` guarda um `Resource3DCameraConfig`
(posição inicial, alvo, distância min/max) por slug — necessário porque um
PCB pequeno, um equipamento de bancada e uma sala de 3×3 m exigem
enquadramentos muito diferentes. `getResource3DEntry(slug)` substitui o
antigo `getResource3DModel(slug)` (agora retorna `{Model, camera}` em vez de
só o componente).

## Arquitetura

```
components/3d/
  resource-3d-viewer-loader.tsx   Client Component com dynamic(..., { ssr: false })
  resource-3d-viewer.tsx          Canvas, luzes, OrbitControls (câmera vem do registry por slug)
  model-error-boundary.tsx        Error boundary React dedicado à cena 3D
  viewer-3d-fallback.tsx          Estado único para loading/sem-WebGL/erro
  models/
    registry.ts                  slug -> { Model, camera }
    primitives.tsx                Peças pequenas reaproveitadas (Led, Glow, CableArc)
    bambu-lab-a1-model.tsx
    flashforge-hunter-model.tsx
    sethi3d-model.tsx
    osciloscopio-model.tsx
    kit-arduino-model.tsx
    kit-eletronica-model.tsx
    di-laboratorio-hardware-model.tsx
    di-laboratorio-redes-model.tsx
    di-oficina-model.tsx
```

`ssr: false` só é permitido a partir de um Client Component no App Router —
por isso o loader existe separado do viewer. Confirmado no build: o chunk
com código do Three.js só é referenciado pelo `react-loadable-manifest` de
`/recursos/[slug]`, nenhuma outra rota (Home, catálogo, etc.).

## Fallback e acessibilidade

- Três estados cobertos por `Viewer3DFallback`: carregando, sem suporte a
  WebGL, erro de render — nunca uma tela em branco.
- Texto visível discreto no canto do viewer: "Arraste para girar · role
  para ampliar" (Prompt 6.2).
- `aria-label` no container + texto `sr-only` explicando que é uma
  representação ilustrativa, não uma reprodução fiel do objeto/ambiente
  real — generalizado no Prompt 6.2 para cobrir tanto produtos quanto
  ambientes (antes só mencionava "CAD oficial do fabricante").
- Para os 3 recursos com cena de ambiente (laboratórios + Oficina), a
  página de detalhe também mostra o aviso visível "Representação visual do
  ambiente — não é uma reprodução exata do espaço real" logo abaixo do
  viewer.

## Performance

- Nenhum Canvas nos cards do catálogo/Home — só na página de detalhe, e só
  um por página (confirmado via contagem de `<canvas>` em QA visual).
- `dpr={[1, 1.5]}` limita a densidade de pixels renderizada.
- Sem `<Environment>`/HDR externo — iluminação só com luzes Three.js
  nativas (ambient + 2 directional), sem fetch de rede.
- Sem `useGLTF`/asset binário em nenhum modelo — todo o 3D é código, ~0 KB
  de asset por recurso.
- `OrbitControls` limitado (`enablePan={false}`, `minDistance`/`maxDistance`
  e `minPolarAngle`/`maxPolarAngle` por recurso) para impedir navegação
  caótica.
- Fotos de produto comprimidas para 44–83 KB cada (`sharp`, `mozjpeg`,
  redimensionadas para no máximo 1200px no maior lado) antes de entrar no
  repositório.

## Packages instalados

`three@0.186.0`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8`,
`@types/three@0.186.0` (dev) — mesmas versões do Prompt 6, nenhuma nova
dependência 3D adicionada no Prompt 6.2. `sharp` foi usado localmente só
para redimensionar as 3 fotos (já vem como dependência opcional do
Next.js — não foi adicionado ao `package.json`).
