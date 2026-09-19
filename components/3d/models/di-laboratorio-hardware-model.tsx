import { RoundedBox } from "@react-three/drei";
import { CableArc, Led } from "@/components/3d/models/primitives";

const BENCH_COLOR = "#c9b48a";
const LEG_COLOR = "#3a3f47";
const TOWER_COLOR = "#e4e6ea";
const WALL_COLOR = "#eef1f4";

/**
 * Cena isométrica procedural do "DI — Laboratório de Hardware": bancada,
 * computador (torre + monitor), teclado e um multímetro. Representação
 * visual do ambiente — não uma reprodução exata da sala real do Senac (ver
 * documentacao/decisoes/modelos-3d.md e o aviso no viewer 3D).
 */
export function DiLaboratorioHardwareModel() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Piso */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#dfe2e6" roughness={0.9} />
      </mesh>
      {/* Parede ao fundo */}
      <mesh position={[0, 0.9, -0.85]} receiveShadow>
        <boxGeometry args={[2.4, 1.8, 0.04]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Bancada */}
      <RoundedBox args={[1.8, 0.06, 0.7]} radius={0.01} smoothness={2} position={[0, 0.62, -0.2]} castShadow receiveShadow>
        <meshStandardMaterial color={BENCH_COLOR} roughness={0.6} />
      </RoundedBox>
      {[[-0.82, -0.5], [0.82, -0.5], [-0.82, 0.1], [0.82, 0.1]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.31, z]} castShadow>
          <boxGeometry args={[0.05, 0.62, 0.05]} />
          <meshStandardMaterial color={LEG_COLOR} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Torre do computador (sob a bancada) */}
      <RoundedBox args={[0.24, 0.5, 0.42]} radius={0.02} smoothness={2} position={[0.7, 0.25, -0.15]} castShadow>
        <meshStandardMaterial color={TOWER_COLOR} roughness={0.4} metalness={0.15} />
      </RoundedBox>
      <Led position={[0.7, 0.4, 0.07]} color="#38a169" intensity={1} radius={0.015} />

      {/* Monitor sobre a bancada */}
      <group position={[-0.15, 0.65, -0.4]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.62, 0.4, 0.025]} />
          <meshStandardMaterial color="#1c1e21" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.32, 0.014]}>
          <planeGeometry args={[0.56, 0.34]} />
          <meshStandardMaterial color="#0e2a45" emissive="#147eb3" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshStandardMaterial color="#3a3f47" />
        </mesh>
        <mesh position={[0, 0.005, 0]} castShadow>
          <boxGeometry args={[0.24, 0.015, 0.14]} />
          <meshStandardMaterial color="#3a3f47" />
        </mesh>
      </group>

      {/* Teclado + mouse */}
      <mesh position={[-0.1, 0.656, 0.02]} rotation={[-0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.36, 0.02, 0.13]} />
        <meshStandardMaterial color="#d8dadd" roughness={0.5} />
      </mesh>
      <mesh position={[0.18, 0.653, 0.08]} castShadow>
        <capsuleGeometry args={[0.025, 0.04, 4, 8]} />
        <meshStandardMaterial color="#d8dadd" roughness={0.4} />
      </mesh>

      {/* Multímetro na bancada */}
      <group position={[0.55, 0.665, 0.15]} rotation={[0, -0.3, 0]}>
        <RoundedBox args={[0.16, 0.03, 0.24]} radius={0.01} smoothness={1} castShadow>
          <meshStandardMaterial color="#e8b93a" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.02, -0.05]}>
          <planeGeometry args={[0.1, 0.08]} />
          <meshStandardMaterial color="#0b2418" emissive="#38d97a" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <CableArc from={[0.58, 0.35, -0.1]} to={[-0.15, 0.32, -0.4]} height={0.1} color="#2a2d31" />
    </group>
  );
}
