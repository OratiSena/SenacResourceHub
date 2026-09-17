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

function BambuLabA1Illustration() {
  return (
    <Svg>
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

function LaboratorioHardwareIllustration() {
  return (
    <Svg>
      <rect x="20" y="108" width="160" height="8" rx="2" fill={GRAPHITE} />
      <rect x="35" y="52" width="22" height="56" rx="3" fill={LIGHT} />
      <circle cx="46" cy="60" r="2.5" fill={SUCCESS} />
      <rect x="68" y="38" width="62" height="46" rx="4" fill={GRAPHITE} />
      <rect x="73" y="43" width="52" height="34" rx="2" fill={BLUE} opacity="0.85" />
      <rect x="90" y="86" width="18" height="14" rx="2" fill={GRAPHITE} />
      <rect x="78" y="100" width="42" height="6" rx="2" fill={MUTED} />
      <rect x="118" y="98" width="45" height="10" rx="2" fill={LIGHT} />
    </Svg>
  );
}

function LaboratorioRedesIllustration() {
  const ports1 = Array.from({ length: 8 }, (_, i) => 45 + i * 12);
  const ports2 = Array.from({ length: 8 }, (_, i) => 45 + i * 12);
  return (
    <Svg>
      <rect x="35" y="42" width="130" height="24" rx="3" fill={GRAPHITE} />
      {ports1.map((x, i) => (
        <rect
          key={x}
          x={x}
          y="50"
          width="7"
          height="9"
          rx="1"
          fill={i % 3 === 0 ? SUCCESS : LIGHT}
        />
      ))}
      <rect x="35" y="72" width="130" height="24" rx="3" fill={NAVY} />
      {ports2.map((x, i) => (
        <rect
          key={x}
          x={x}
          y="80"
          width="7"
          height="9"
          rx="1"
          fill={i % 4 === 0 ? BLUE : LIGHT}
        />
      ))}
      <path d="M60,96 Q60,112 75,116" stroke={GRAPHITE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M100,96 Q100,112 115,116" stroke={BLUE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function OficinaIllustration() {
  return (
    <Svg>
      <rect
        x="30"
        y="20"
        width="140"
        height="100"
        rx="6"
        fill="#FFFFFF"
        stroke={MUTED}
        strokeWidth="1.5"
      />
      {[45, 65, 85, 105, 125, 145].flatMap((x) =>
        [35, 55, 75, 95, 115].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill={MUTED} opacity="0.6" />
        )),
      )}
      <g transform="rotate(-25 90 65)">
        <rect x="55" y="60" width="70" height="10" rx="5" fill={GRAPHITE} />
        <circle cx="50" cy="65" r="12" fill={GRAPHITE} />
        <circle cx="50" cy="65" r="6" fill="#FFFFFF" />
        <circle cx="130" cy="65" r="10" fill={GRAPHITE} />
        <circle cx="130" cy="65" r="5" fill="#FFFFFF" />
      </g>
      <circle cx="130" cy="85" r="16" fill={ORANGE} />
      <circle cx="130" cy="85" r="7" fill={LIGHT} />
      <line x1="130" y1="61" x2="130" y2="69" stroke={ORANGE} strokeWidth="3" />
      <line x1="130" y1="101" x2="130" y2="109" stroke={ORANGE} strokeWidth="3" />
      <line x1="106" y1="85" x2="114" y2="85" stroke={ORANGE} strokeWidth="3" />
      <line x1="146" y1="85" x2="154" y2="85" stroke={ORANGE} strokeWidth="3" />
      <line x1="114.7" y1="69.7" x2="120.4" y2="75.4" stroke={ORANGE} strokeWidth="3" />
      <line x1="139.6" y1="94.6" x2="145.3" y2="100.3" stroke={ORANGE} strokeWidth="3" />
      <line x1="145.3" y1="69.7" x2="139.6" y2="75.4" stroke={ORANGE} strokeWidth="3" />
      <line x1="120.4" y1="94.6" x2="114.7" y2="100.3" stroke={ORANGE} strokeWidth="3" />
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
