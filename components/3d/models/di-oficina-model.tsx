import { RoundedBox } from "@react-three/drei";

const BENCH_COLOR = "#8a6a45";
const METAL_COLOR = "#7a828c";
const MACHINE_COLOR = "#c94040";

/**
 * Cena isométrica procedural da "DI — Oficina de Fabricação e
 * Prototipagem": bancada robusta, morsa, uma máquina genérica (tipo
 * furadeira de bancada) e sinalização de segurança discreta. Representação
 * visual do ambiente, não uma reprodução exata da oficina real do Senac nem
 * de um equipamento específico documentado (ver
 * documentacao/decisoes/modelos-3d.md e o aviso no viewer 3D).
 */
export function DiOficinaModel() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Piso */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#d4d6da" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.9, -0.85]} receiveShadow>
        <boxGeometry args={[2.4, 1.8, 0.04]} />
        <meshStandardMaterial color="#e6e4de" roughness={0.9} />
      </mesh>

      {/* Bancada robusta de madeira/metal */}
      <RoundedBox args={[1.9, 0.08, 0.8]} radius={0.01} smoothness={2} position={[0, 0.66, -0.15]} castShadow receiveShadow>
        <meshStandardMaterial color={BENCH_COLOR} roughness={0.7} />
      </RoundedBox>
      {[[-0.85, -0.5], [0.85, -0.5], [-0.85, 0.15], [0.85, 0.15]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.32, z]} castShadow>
          <boxGeometry args={[0.07, 0.66, 0.07]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* Prateleira inferior */}
      <mesh position={[0, 0.12, -0.15]} castShadow>
        <boxGeometry args={[1.7, 0.03, 0.7]} />
        <meshStandardMaterial color={BENCH_COLOR} roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 0.19, -0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.16, 20]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.6} />
      </mesh>

      {/* Morsa de bancada */}
      <group position={[-0.5, 0.7, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.1, 0.14]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.02, 0.02, 0.09]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, -0.09]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0.09, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color="#3a3f47" roughness={0.5} />
        </mesh>
      </group>

      {/* Máquina de bancada genérica (tipo furadeira) */}
      <group position={[0.55, 0.7, -0.15]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.06, 0.2]} />
          <meshStandardMaterial color={MACHINE_COLOR} roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[-0.06, 0.35, -0.06]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.7, 12]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[-0.06, 0.62, 0.02]} castShadow>
          <boxGeometry args={[0.28, 0.08, 0.16]} />
          <meshStandardMaterial color={MACHINE_COLOR} roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0.02, 0.42, 0.06]} castShadow>
          <cylinderGeometry args={[0.015, 0.008, 0.14, 10]} />
          <meshStandardMaterial color="#c7cad1" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[-0.06, 0.5, 0.11]} castShadow>
          <boxGeometry args={[0.03, 0.16, 0.04]} />
          <meshStandardMaterial color="#2a2d31" roughness={0.4} />
        </mesh>
      </group>

      {/* Painel de ferramentas na parede (silhuetas simples) */}
      <mesh position={[-0.7, 1.25, -0.83]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.02]} />
        <meshStandardMaterial color="#b9bcc2" roughness={0.7} />
      </mesh>
      {[-0.85, -0.7, -0.55].map((x) => (
        <mesh key={x} position={[x, 1.32, -0.815]} rotation={[0, 0, Math.PI / 8]} castShadow>
          <boxGeometry args={[0.03, 0.22, 0.015]} />
          <meshStandardMaterial color="#3a3f47" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Sinalização de segurança discreta (placa amarela) */}
      <group position={[0.75, 1.35, -0.82]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.22, 0.015]} />
          <meshStandardMaterial color="#f2c230" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <ringGeometry args={[0.05, 0.075, 3]} />
          <meshStandardMaterial color="#1c1e21" side={2} />
        </mesh>
      </group>
    </group>
  );
}
