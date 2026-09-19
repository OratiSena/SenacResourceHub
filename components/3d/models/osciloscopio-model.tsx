import { RoundedBox } from "@react-three/drei";
import { Led } from "@/components/3d/models/primitives";

const BODY_COLOR = "#dfe1e6";
const BEZEL_COLOR = "#1c1e21";
const SCREEN_BG = "#0b2418";
const TRACE_COLOR = "#38d97a";

// Meio-comprimento do corpo no eixo Z (args[2]/2) — usado para colocar tela e
// botões exatamente na face frontal, nunca embutidos dentro do sólido.
const BODY_HALF_DEPTH = 0.275;
const FRONT_Z = BODY_HALF_DEPTH + 0.002;

const KNOBS = [
  { x: 0.3, y: 0.02, color: "#3a3f47" },
  { x: 0.4, y: 0.02, color: "#3a3f47" },
  { x: 0.3, y: -0.14, color: "#147eb3" },
  { x: 0.4, y: -0.14, color: "#f28c28" },
] as const;

const WAVE_POINTS = [
  -0.26, 0.02, -0.2, -0.05, -0.14, 0.09, -0.08, -0.09, -0.02, 0.11, 0.04,
  -0.07, 0.1, 0.05, 0.16, -0.03, 0.22, 0.02,
];

/**
 * Representação 3D procedural de um osciloscópio de bancada digital.
 * Procedural por decisão (ver documentacao/decisoes/modelos-3d.md) — não
 * modela um equipamento de marca específica, já que o catálogo trata
 * "Osciloscópio" como um equipamento genérico (12 unidades no seed).
 *
 * Corpo, tela e botões são todos filhos do MESMO group (posição/rotação
 * aplicadas uma única vez); tela e botões usam coordenadas locais (antes da
 * rotação) relativas ao centro do corpo, com z = FRONT_Z para ficarem
 * exatamente sobre a face frontal em vez de embutidos dentro do sólido.
 */
export function OsciloscopioModel() {
  const wavePairs: [number, number][] = [];
  for (let i = 0; i < WAVE_POINTS.length; i += 2) {
    wavePairs.push([WAVE_POINTS[i], WAVE_POINTS[i + 1]]);
  }

  return (
    <group position={[0, 0.38, 0]} rotation={[0.14, 0, 0]}>
      {/* Corpo principal */}
      <RoundedBox args={[1.0, 0.62, BODY_HALF_DEPTH * 2]} radius={0.03} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.1} />
      </RoundedBox>

      {/* Pés / apoio (levemente abaixo e atrás, sugerindo a base inclinada) */}
      <mesh position={[0, -0.32, -0.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.9, 0.03, 0.4]} />
        <meshStandardMaterial color="#c7cad1" roughness={0.6} />
      </mesh>

      {/* Moldura + tela, no lado esquerdo da face frontal */}
      <group position={[-0.15, 0.06, FRONT_Z]}>
        <mesh>
          <boxGeometry args={[0.46, 0.34, 0.02]} />
          <meshStandardMaterial color={BEZEL_COLOR} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.4, 0.28]} />
          <meshStandardMaterial color={SCREEN_BG} emissive={SCREEN_BG} emissiveIntensity={0.5} />
        </mesh>
        {/* Traço da forma de onda — segmentos finos formando uma senoide simplificada */}
        {wavePairs.slice(0, -1).map(([x, y], i) => {
          const [nx, ny] = wavePairs[i + 1];
          const dx = nx - x;
          const dy = ny - y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          return (
            <mesh
              key={i}
              position={[(x + nx) / 2, (y + ny) / 2, 0.014]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[length, 0.012, 0.002]} />
              <meshStandardMaterial
                color={TRACE_COLOR}
                emissive={TRACE_COLOR}
                emissiveIntensity={1.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Botões, knobs e conectores no lado direito da face frontal */}
      {KNOBS.map((k) => (
        <mesh key={`${k.x}-${k.y}`} position={[k.x, k.y, FRONT_Z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
          <meshStandardMaterial color={k.color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {[0.28, 0.42].map((x) => (
        <mesh key={x} position={[x, -0.24, FRONT_Z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial color="#8a8f97" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      <Led position={[0.45, 0.24, FRONT_Z]} color="#38a169" intensity={1} radius={0.015} />
    </group>
  );
}
