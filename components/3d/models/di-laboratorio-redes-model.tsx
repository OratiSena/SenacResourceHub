import { RoundedBox } from "@react-three/drei";
import { CableArc, Led } from "@/components/3d/models/primitives";

const BENCH_COLOR = "#c9b48a";
const RACK_COLOR = "#1c1e21";
const UNIT_COLOR = "#2c2f34";

const SWITCH_PORTS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Cena isométrica procedural do "DI — Laboratório de Redes": rack com
 * switches/patch panel, bancada e um computador. Representação visual do
 * ambiente — não uma reprodução exata da sala real do Senac (ver
 * documentacao/decisoes/modelos-3d.md e o aviso no viewer 3D).
 */
export function DiLaboratorioRedesModel() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Piso */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#dfe2e6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.9, -0.85]} receiveShadow>
        <boxGeometry args={[2.4, 1.8, 0.04]} />
        <meshStandardMaterial color="#eef1f4" roughness={0.9} />
      </mesh>

      {/* Rack de rede */}
      <group position={[-0.55, 0, -0.35]}>
        <RoundedBox args={[0.5, 1.5, 0.55]} radius={0.02} smoothness={2} position={[0, 0.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={RACK_COLOR} roughness={0.5} metalness={0.2} />
        </RoundedBox>
        {/* Unidades do rack (patch panel + switches) */}
        {[1.28, 1.12, 0.9, 0.68].map((y, idx) => (
          <mesh key={y} position={[0, y, 0.285]} castShadow>
            <boxGeometry args={[0.44, idx === 0 ? 0.08 : 0.14, 0.03]} />
            <meshStandardMaterial color={UNIT_COLOR} roughness={0.5} metalness={0.1} />
          </mesh>
        ))}
        {/* Portas do switch principal (linha de LEDs) */}
        {SWITCH_PORTS.map((i) => (
          <Led
            key={i}
            position={[-0.18 + (i % 6) * 0.07, 0.9 + Math.floor(i / 6) * 0.05, 0.302]}
            color={i % 4 === 0 ? "#f28c28" : "#38a169"}
            intensity={0.8}
            radius={0.008}
          />
        ))}
      </group>

      {/* Bancada */}
      <RoundedBox args={[1.5, 0.06, 0.7]} radius={0.01} smoothness={2} position={[0.35, 0.62, -0.2]} castShadow receiveShadow>
        <meshStandardMaterial color={BENCH_COLOR} roughness={0.6} />
      </RoundedBox>
      {[[-0.25, -0.5], [0.95, -0.5], [-0.25, 0.1], [0.95, 0.1]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[0.35 + x, 0.31, z]} castShadow>
          <boxGeometry args={[0.05, 0.62, 0.05]} />
          <meshStandardMaterial color="#3a3f47" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Notebook sobre a bancada */}
      <group position={[0.35, 0.655, -0.2]} rotation={[0, -0.1, 0]}>
        <mesh position={[0, 0.005, 0.08]} castShadow>
          <boxGeometry args={[0.42, 0.02, 0.3]} />
          <meshStandardMaterial color="#d8dadd" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.16, -0.06]} rotation={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.28, 0.015]} />
          <meshStandardMaterial color="#1c1e21" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.17, -0.053]} rotation={[-0.25, 0, 0]}>
          <planeGeometry args={[0.37, 0.22]} />
          <meshStandardMaterial color="#0e2a45" emissive="#147eb3" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Cabo de rede ligando o rack à bancada */}
      <CableArc from={[-0.4, 0.9, -0.15]} to={[0.2, 0.66, -0.15]} height={0.18} color="#38a169" radius={0.01} />
      <CableArc from={[-0.4, 0.68, -0.1]} to={[0.15, 0.66, -0.35]} height={0.12} color="#f28c28" radius={0.01} />
    </group>
  );
}
