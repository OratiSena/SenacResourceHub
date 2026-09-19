import { RoundedBox } from "@react-three/drei";
import { Glow } from "@/components/3d/models/primitives";

const BODY_COLOR = "#dfe1e6";
const DARK_COLOR = "#26292e";
const WINDOW_COLOR = "#9fb4c2";

/**
 * Representação 3D procedural da Sethi3D (impressora de gabinete fechado,
 * grande volume, FDM). Procedural por decisão de projeto — ver
 * documentacao/decisoes/modelos-3d.md. Diferenciada da Flashforge Hunter DLP
 * (também de gabinete fechado) por ser mais alta/robusta e mostrar um
 * gantry/mesa de FDM através da porta, em vez de um vat de resina.
 */
export function Sethi3DModel() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Base */}
      <RoundedBox args={[1.3, 0.16, 1.2]} radius={0.03} smoothness={2} position={[0, 0.08, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DARK_COLOR} roughness={0.5} metalness={0.2} />
      </RoundedBox>

      {/* Gabinete */}
      <RoundedBox args={[1.15, 1.55, 1.05]} radius={0.04} smoothness={2} position={[0, 0.95, 0]} castShadow>
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.08} />
      </RoundedBox>

      {/* Porta / janela frontal semitransparente */}
      <mesh position={[0, 0.95, 0.53]}>
        <planeGeometry args={[0.92, 1.3]} />
        <meshPhysicalMaterial
          color={WINDOW_COLOR}
          transparent
          opacity={0.35}
          roughness={0.1}
          transmission={0.6}
        />
      </mesh>
      {/* Moldura da porta */}
      <mesh position={[0.44, 0.95, 0.535]}>
        <boxGeometry args={[0.04, 1.3, 0.02]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.5} />
      </mesh>

      {/* Mesa de impressão interna (visível através da porta) */}
      <mesh position={[0, 0.45, 0.1]} castShadow>
        <boxGeometry args={[0.85, 0.05, 0.7]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.7} />
      </mesh>

      {/* Colunas Z internas (duas, típico de impressoras de gabinete grande) */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 1.05, -0.35]} castShadow>
          <boxGeometry args={[0.06, 1.2, 0.06]} />
          <meshStandardMaterial color="#9095a0" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}

      {/* Gantry / viga X interna */}
      <mesh position={[0, 0.95, -0.1]} castShadow>
        <boxGeometry args={[0.95, 0.06, 0.5]} />
        <meshStandardMaterial color="#9095a0" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Cabeçote */}
      <mesh position={[0.1, 0.88, 0.05]} castShadow>
        <boxGeometry args={[0.14, 0.16, 0.16]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.5} />
      </mesh>

      {/* Painel de controle no topo */}
      <RoundedBox args={[1.1, 0.12, 1.0]} radius={0.02} smoothness={2} position={[0, 1.79, 0]} castShadow>
        <meshStandardMaterial color={DARK_COLOR} roughness={0.5} metalness={0.2} />
      </RoundedBox>
      <Glow position={[-0.3, 1.855, 0.2]} rotation={[-Math.PI / 2, 0, 0]} size={[0.36, 0.22]} color="#147eb3" intensity={0.55} />
    </group>
  );
}
