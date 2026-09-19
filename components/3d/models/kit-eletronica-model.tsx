import { RoundedBox } from "@react-three/drei";
import { CableArc, Led } from "@/components/3d/models/primitives";

const BOARD_COLOR = "#f4f1e8";
const RAIL_RED = "#c94040";
const RAIL_BLUE = "#2f6fb0";

const RESISTORS = [
  { x: -0.3, z: 0.1, color: "#c9a227" },
  { x: -0.1, z: 0.1, color: "#8a5a2b" },
] as const;

const SILVER_LEG = "#b7bcc4";

/**
 * Representação 3D procedural de uma protoboard (breadboard) com alguns
 * componentes — recurso "Kit de Eletrônica" no catálogo. Procedural por
 * decisão de projeto (ver documentacao/decisoes/modelos-3d.md): o card já
 * usa uma foto real licenciada (CC BY-SA, Wikimedia Commons) para este
 * recurso — este modelo é só para a página de detalhe, dando uma segunda
 * perspectiva 3D interativa.
 */
export function KitEletronicaModel() {
  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0.1, 0]}>
      {/* Placa de contato (protoboard) */}
      <RoundedBox args={[1.4, 0.06, 0.9]} radius={0.015} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
      </RoundedBox>

      {/* Trilhos de alimentação (+ vermelho, - azul) nas bordas */}
      <mesh position={[0, 0.032, 0.38]}>
        <boxGeometry args={[1.3, 0.005, 0.03]} />
        <meshStandardMaterial color={RAIL_RED} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.032, 0.32]}>
        <boxGeometry args={[1.3, 0.005, 0.03]} />
        <meshStandardMaterial color={RAIL_BLUE} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.032, -0.38]}>
        <boxGeometry args={[1.3, 0.005, 0.03]} />
        <meshStandardMaterial color={RAIL_RED} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.032, -0.32]}>
        <boxGeometry args={[1.3, 0.005, 0.03]} />
        <meshStandardMaterial color={RAIL_BLUE} roughness={0.5} />
      </mesh>

      {/* Furos simulados (grade discreta, poucos pontos para manter leve) */}
      {Array.from({ length: 10 }, (_, col) =>
        Array.from({ length: 6 }, (_, row) => (
          <mesh
            key={`${col}-${row}`}
            position={[-0.58 + col * 0.13, 0.033, -0.12 + row * 0.05]}
          >
            <cylinderGeometry args={[0.008, 0.008, 0.01, 6]} />
            <meshStandardMaterial color="#c9c4b3" />
          </mesh>
        )),
      )}

      {/* LED com pernas */}
      <group position={[0.15, 0.06, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.05, 4, 12]} />
          <meshStandardMaterial color="#d63b3b" emissive="#d63b3b" emissiveIntensity={0.6} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-0.015, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.09, 6]} />
          <meshStandardMaterial color={SILVER_LEG} />
        </mesh>
        <mesh position={[0.015, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.11, 6]} />
          <meshStandardMaterial color={SILVER_LEG} />
        </mesh>
      </group>

      {/* Resistores com faixas de cor */}
      {RESISTORS.map((r) => (
        <mesh key={r.x} position={[r.x, 0.05, r.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 12]} />
          <meshStandardMaterial color="#e8d9b0" roughness={0.5} />
        </mesh>
      ))}

      {/* Fios jumper (arcos) ligando pontos da placa */}
      <CableArc from={[-0.45, 0.05, 0.2]} to={[-0.25, 0.05, -0.1]} height={0.12} color="#c94040" />
      <CableArc from={[0.3, 0.05, -0.2]} to={[0.55, 0.05, 0.15]} height={0.1} color="#2f6fb0" />

      <Led position={[0.45, 0.07, -0.25]} color="#38a169" intensity={0.9} radius={0.02} />
    </group>
  );
}
