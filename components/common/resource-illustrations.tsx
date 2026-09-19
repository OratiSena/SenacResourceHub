import type { ComponentType, ReactNode } from "react";

/**
 * Ilustrações próprias (SVG inline, sem dependência nova e sem asset
 * binário) para cada um dos 9 recursos semente — substituem o ícone genérico
 * único por tipo (Prompt 6.1). Cores restritas à paleta já existente do
 * projeto (navy/blue/orange/graphite/success + neutros), para manter a
 * identidade visual.
 *
 * Cada componente desenha só o desenho em si; o fundo (gradiente, padding,
 * aria-label) é responsabilidade de ResourceMediaPlaceholder, que também
 * cai de volta no ícone genérico por tipo caso o slug não esteja aqui —
 * esse é o fallback visual pedido no Prompt 6.1.
 */

const NAVY = "#0B2942";
const BLUE = "#147EB3";
const ORANGE = "#F28C28";
const GRAPHITE = "#202B33";
const SUCCESS = "#38A169";
const LIGHT = "#E2E8F0";
const LIGHTER = "#F3F4F6";
const MUTED = "#94A3B8";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className="h-auto w-full max-w-[190px]"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * Caixa isométrica simples (projeção dimétrica 2:1) — usada pelas cenas de
 * ambiente (laboratórios, Oficina) para compor bancadas/equipamentos em
 * profundidade, em vez de um único ícone plano. `(x, y)` é o canto
 * inferior-frontal da caixa; `w` cresce para a direita, `d` para trás-esquerda,
 * `h` para cima.
 */
function IsoBox({
  x,
  y,
  w,
  d,
  h,
  topColor,
  leftColor,
  rightColor,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
}) {
  const frontBottom: [number, number] = [x, y];
  const rightBottom: [number, number] = [x + w, y - w / 2];
  const backBottom: [number, number] = [x + w - d, y - w / 2 - d / 2];
  const leftBottom: [number, number] = [x - d, y - d / 2];

  const shift = ([px, py]: [number, number]): [number, number] => [px, py - h];
  const frontTop = shift(frontBottom);
  const rightTop = shift(rightBottom);
  const backTop = shift(backBottom);
  const leftTop = shift(leftBottom);

  const pts = (arr: [number, number][]) => arr.map((p) => p.join(",")).join(" ");

  return (
    <g>
      <polygon points={pts([frontBottom, leftBottom, leftTop, frontTop])} fill={leftColor} />
      <polygon points={pts([frontBottom, rightBottom, rightTop, frontTop])} fill={rightColor} />
      <polygon points={pts([frontTop, rightTop, backTop, leftTop])} fill={topColor} />
    </g>
  );
}

function BambuLabA1Illustration() {
  return (
    <Svg>
      <ellipse cx="100" cy="122" rx="58" ry="8" fill={NAVY} opacity="0.08" />
      <rect x="50" y="115" width="100" height="10" rx="3" fill={GRAPHITE} />
      <rect x="65" y="35" width="70" height="80" rx="4" fill={LIGHT} />
      <rect x="65" y="35" width="70" height="10" rx="3" fill={MUTED} />
      <rect x="75" y="55" width="14" height="10" rx="2" fill={BLUE} />
      <rect x="105" y="45" width="12" height="14" rx="2" fill={GRAPHITE} />
      <polygon points="108,59 117,59 112.5,68" fill={ORANGE} />
      <circle cx="70" cy="90" r="9" fill={BLUE} />
      <circle cx="70" cy="90" r="3.5" fill={NAVY} />
      <circle cx="88" cy="95" r="7" fill={SUCCESS} />
      <circle cx="88" cy="95" r="3" fill={NAVY} />
    </Svg>
  );
}

function FlashforgeHunterIllustration() {
  return (
    <Svg>
      <ellipse cx="100" cy="118" rx="52" ry="7" fill={NAVY} opacity="0.08" />
      <rect x="55" y="25" width="90" height="95" rx="6" fill={GRAPHITE} />
      <rect x="55" y="25" width="90" height="8" rx="4" fill={NAVY} />
      <rect
        x="75"
        y="52"
        width="50"
        height="42"
        rx="4"
        fill={ORANGE}
        opacity="0.55"
      />
      <rect x="75" y="52" width="50" height="42" rx="4" fill="none" stroke={ORANGE} strokeWidth="2" />
      <rect x="85" y="58" width="30" height="6" rx="2" fill={LIGHTER} opacity="0.8" />
      <rect x="65" y="100" width="70" height="12" rx="2" fill={NAVY} />
      <circle cx="72" cy="106" r="3" fill={BLUE} />
    </Svg>
  );
}

function Sethi3DIllustration() {
  return (
    <Svg>
      <ellipse cx="100" cy="126" rx="58" ry="7" fill={NAVY} opacity="0.08" />
      <rect x="45" y="120" width="110" height="8" rx="3" fill={GRAPHITE} />
      <rect
        x="50"
        y="30"
        width="100"
        height="90"
        rx="8"
        fill="#FFFFFF"
        stroke={MUTED}
        strokeWidth="2"
      />
      <rect x="70" y="45" width="60" height="55" rx="4" fill={NAVY} opacity="0.85" />
      <rect x="70" y="45" width="60" height="55" rx="4" fill="none" stroke={GRAPHITE} strokeWidth="1.5" />
      <rect x="86" y="20" width="4" height="8" fill={MUTED} />
      <rect x="98" y="20" width="4" height="8" fill={MUTED} />
      <rect x="110" y="20" width="4" height="8" fill={MUTED} />
    </Svg>
  );
}

function OsciloscopioIllustration() {
  return (
    <Svg>
      <rect x="30" y="25" width="140" height="90" rx="8" fill={GRAPHITE} />
      <rect x="45" y="38" width="80" height="55" rx="4" fill={NAVY} />
      <polyline
        points="50,65 60,65 66,45 76,85 86,45 96,85 106,65 120,65"
        fill="none"
        stroke={ORANGE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="45" y="100" width="10" height="6" rx="1.5" fill={MUTED} />
      <rect x="59" y="100" width="10" height="6" rx="1.5" fill={MUTED} />
      <rect x="73" y="100" width="10" height="6" rx="1.5" fill={MUTED} />
      <circle cx="140" cy="53" r="8" fill={LIGHT} />
      <circle cx="140" cy="75" r="8" fill={LIGHT} />
      <circle cx="140" cy="97" r="8" fill={BLUE} />
    </Svg>
  );
}

function KitArduinoIllustration() {
  const pins = Array.from({ length: 9 }, (_, i) => 42 + i * 13);
  return (
    <Svg>
      <rect x="35" y="30" width="130" height="80" rx="6" fill={BLUE} />
      {pins.map((x) => (
        <rect key={`top-${x}`} x={x} y="26" width="3" height="8" fill={GRAPHITE} />
      ))}
      {pins.map((x) => (
        <rect key={`bottom-${x}`} x={x} y="106" width="3" height="8" fill={GRAPHITE} />
      ))}
      <rect x="30" y="45" width="16" height="22" rx="2" fill={LIGHT} />
      <rect x="90" y="52" width="32" height="22" rx="2" fill={GRAPHITE} />
      <circle cx="80" cy="55" r="2" fill={LIGHTER} />
      <circle cx="150" cy="45" r="6" fill={ORANGE} />
    </Svg>
  );
}

function KitEletronicaIllustration() {
  const dots = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      dots.push({ x: 38 + col * 12, y: 32 + row * 15 });
    }
  }
  return (
    <Svg>
      <rect x="30" y="25" width="140" height="90" rx="6" fill={LIGHTER} stroke={LIGHT} strokeWidth="2" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.4" fill={MUTED} />
      ))}
      <path d="M50,40 Q90,20 130,50" stroke={BLUE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60,95 Q100,112 142,82" stroke={ORANGE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M70,62 Q92,78 112,60" stroke={SUCCESS} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="45" y="92" width="28" height="10" rx="3" fill="#D9C9A3" />
      <circle cx="150" cy="98" r="6" fill={ORANGE} />
      <circle cx="148" cy="96" r="1.8" fill={LIGHTER} />
    </Svg>
  );
}

const WOOD = "#c9b48a";
const WOOD_DARK = "#a3895c";
const WOOD_MED = "#b9a077";
const METAL = "#9ea4ad";
const METAL_DARK = "#7a828c";
const METAL_LIGHT = "#c7cad1";

/** Sombra elíptica no "chão" da cena isométrica, para dar apoio visual. */
function IsoFloorShadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={NAVY} opacity="0.08" />;
}

function LaboratorioHardwareIllustration() {
  return (
    <Svg>
      <IsoFloorShadow cx={112} cy={124} rx={66} ry={14} />
      {/* Bancada */}
      <IsoBox x={100} y={122} w={64} h={9} d={38} topColor={WOOD} leftColor={WOOD_DARK} rightColor={WOOD_MED} />
      {/* Torre do computador ao lado da bancada */}
      <IsoBox x={58} y={120} w={16} h={28} d={16} topColor={METAL_LIGHT} leftColor={METAL_DARK} rightColor={METAL} />
      <circle cx="62" cy="104" r="1.6" fill={SUCCESS} />
      {/* Monitor sobre a bancada */}
      <IsoBox x={128} y={100} w={26} h={20} d={3} topColor={GRAPHITE} leftColor={GRAPHITE} rightColor={BLUE} />
      <IsoBox x={136} y={100} w={6} h={6} d={6} topColor={METAL} leftColor={METAL_DARK} rightColor={METAL} />
      {/* Teclado */}
      <IsoBox x={96} y={109} w={26} h={2.5} d={10} topColor={LIGHTER} leftColor={LIGHT} rightColor={MUTED} />
      {/* Multímetro pequeno */}
      <IsoBox x={140} y={112} w={10} h={3} d={8} topColor={ORANGE} leftColor="#c96a1e" rightColor="#d97b2a" />
    </Svg>
  );
}

function LaboratorioRedesIllustration() {
  return (
    <Svg>
      <IsoFloorShadow cx={110} cy={126} rx={70} ry={13} />
      {/* Bancada */}
      <IsoBox x={130} y={124} w={54} h={8} d={30} topColor={WOOD} leftColor={WOOD_DARK} rightColor={WOOD_MED} />
      {/* Notebook sobre a bancada */}
      <IsoBox x={148} y={112} w={18} h={1.5} d={12} topColor={METAL_LIGHT} leftColor={METAL} rightColor={METAL_LIGHT} />
      <IsoBox x={148} y={110.5} w={18} h={11} d={1.2} topColor={GRAPHITE} leftColor={GRAPHITE} rightColor={BLUE} />
      {/* Rack de rede */}
      <IsoBox x={56} y={122} w={26} h={62} d={18} topColor="#2c2f34" leftColor="#17181b" rightColor="#1f2124" />
      {/* Unidades do rack (patch panel + switches) com portas coloridas */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={38 - row * 9} y={82 - row * 15} width="16" height="6" rx="1" fill={row === 0 ? NAVY : GRAPHITE} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect
              key={i}
              x={39 - row * 9 + i * 3}
              y={83 - row * 15}
              width="1.6"
              height="3.4"
              fill={i % 2 === 0 ? SUCCESS : (row === 0 ? BLUE : ORANGE)}
            />
          ))}
        </g>
      ))}
      <path d="M55,95 Q75,102 96,113" stroke={SUCCESS} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50,110 Q80,118 100,120" stroke={ORANGE} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function OficinaIllustration() {
  return (
    <Svg>
      <IsoFloorShadow cx={108} cy={128} rx={72} ry={13} />
      {/* Bancada robusta */}
      <IsoBox x={130} y={126} w={58} h={10} d={34} topColor={WOOD} leftColor={WOOD_DARK} rightColor={WOOD_MED} />
      {/* Máquina de bancada (tipo furadeira) */}
      <IsoBox x={150} y={112} w={16} h={8} d={14} topColor={METAL_LIGHT} leftColor={METAL_DARK} rightColor={METAL} />
      <rect x="148" y="70" width="3" height="38" fill={METAL} />
      <IsoBox x={158} y={80} w={14} h={5} d={8} topColor="#d24f4f" leftColor="#a83636" rightColor="#c94040" />
      {/* Morsa na bancada */}
      <IsoBox x={110} y={116} w={14} h={7} d={10} topColor={METAL_LIGHT} leftColor={METAL_DARK} rightColor={METAL} />
      {/* Painel de ferramentas na parede */}
      <rect x="30" y="35" width="46" height="34" rx="3" fill="#e7e5e0" stroke={MUTED} strokeWidth="1" />
      {[40, 52, 64].map((x, i) => (
        <rect key={x} x={x} y={44 + (i % 2) * 6} width="3" height="18" rx="1.5" fill={GRAPHITE} transform={`rotate(${-12 + i * 8} ${x} 50)`} />
      ))}
      {/* Sinalização de segurança discreta */}
      <g transform="translate(30 90)">
        <polygon points="10,0 20,17 0,17" fill={ORANGE} stroke={GRAPHITE} strokeWidth="1" />
        <rect x="9" y="6" width="2" height="6" fill={GRAPHITE} />
        <circle cx="10" cy="14" r="1" fill={GRAPHITE} />
      </g>
    </Svg>
  );
}

export const RESOURCE_ILLUSTRATIONS: Record<string, ComponentType> = {
  "bambu-lab-a1": BambuLabA1Illustration,
  "flashforge-hunter-dlp": FlashforgeHunterIllustration,
  sethi3d: Sethi3DIllustration,
  osciloscopio: OsciloscopioIllustration,
  "kit-arduino": KitArduinoIllustration,
  "kit-eletronica": KitEletronicaIllustration,
  "di-laboratorio-hardware": LaboratorioHardwareIllustration,
  "di-laboratorio-redes": LaboratorioRedesIllustration,
  "di-oficina-fabricacao-prototipagem": OficinaIllustration,
};
