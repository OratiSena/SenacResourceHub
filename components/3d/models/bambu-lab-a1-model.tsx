const FRAME_COLOR = "#e9eaee";
const DARK_COLOR = "#24272c";
const SCREEN_COLOR = "#147eb3";
const NOZZLE_COLOR = "#f28c28";
const SPOOLS = [
  { x: -0.82, color: "#147eb3" },
  { x: -0.6, color: "#38a169" },
] as const;

/**
 * Representação 3D simplificada/procedural da Bambu Lab A1, feita só com
 * primitivas do Three.js — NÃO é um modelo CAD oficial do fabricante. Ver
 * documentacao/decisoes/modelos-3d.md para a justificativa dessa escolha.
 * Pensada para ser reconhecível como uma impressora 3D de gantry com torre
 * traseira, não para precisão milimétrica.
 */
export function BambuLabA1Model() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Mesa de impressão */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 1.4]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.7} />
      </mesh>

      {/* Torre traseira */}
      <mesh position={[0, 0.75, -0.62]} castShadow>
        <boxGeometry args={[1.5, 1.4, 0.08]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Tela */}
      <mesh position={[-0.5, 0.55, -0.575]}>
        <boxGeometry args={[0.24, 0.16, 0.02]} />
        <meshStandardMaterial
          color={SCREEN_COLOR}
          emissive={SCREEN_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Viga superior (gantry) */}
      <mesh position={[0, 1.4, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.09, 0.85]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Cabeçote de impressão */}
      <group position={[0.25, 1.18, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.22, 0.24]} />
          <meshStandardMaterial color={DARK_COLOR} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <coneGeometry args={[0.05, 0.1, 16]} />
          <meshStandardMaterial color={NOZZLE_COLOR} />
        </mesh>
      </group>

      {/* Carretéis de filamento (AMS simplificado) */}
      {SPOOLS.map((spool) => (
        <mesh
          key={spool.x}
          position={[spool.x, 1.05, -0.55]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.14, 0.14, 0.07, 24]} />
          <meshStandardMaterial color={spool.color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
