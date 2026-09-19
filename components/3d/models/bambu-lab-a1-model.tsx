import { RoundedBox } from "@react-three/drei";

const FRAME_COLOR = "#e9eaee";
const FRAME_DARK = "#c7cad1";
const DARK_COLOR = "#24272c";
const BED_COLOR = "#2f333a";
const SCREEN_COLOR = "#147eb3";
const NOZZLE_COLOR = "#f28c28";
const BELT_COLOR = "#15171a";
const SPOOLS = [
  { x: -0.34, color: "#147eb3" },
  { x: 0.34, color: "#38a169" },
] as const;

/**
 * Representação 3D procedural da Bambu Lab A1 (Prompt 6.2 — segunda versão,
 * bem mais detalhada que a do Prompt 6). Continua feita só com primitivas do
 * Three.js/drei — NÃO é um modelo CAD oficial do fabricante. Ver
 * documentacao/decisoes/modelos-3d.md.
 *
 * Aproxima as características mais reconhecíveis da A1 real: chassi aberto
 * tipo cantilever (coluna Z só do lado direito, lado esquerdo do gantry fica
 * "flutuando"), base larga, mesa de impressão, painel traseiro com tela,
 * cabeçote com ventoinha e bico, e dois carretéis de filamento externos no
 * topo traseiro (referência ao AMS lite).
 */
export function BambuLabA1Model() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Base / chassi */}
      <RoundedBox args={[1.7, 0.1, 1.5]} radius={0.03} smoothness={2} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={FRAME_DARK} roughness={0.55} metalness={0.15} />
      </RoundedBox>

      {/* Mesa de impressão (textura de PEI escura) */}
      <RoundedBox args={[1.5, 0.03, 1.3]} radius={0.015} smoothness={2} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BED_COLOR} roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* Coluna Z — só do lado direito (design cantilever característico) */}
      <RoundedBox args={[0.09, 1.55, 0.16]} radius={0.02} smoothness={2} position={[0.78, 0.85, -0.6]} castShadow>
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.35} />
      </RoundedBox>

      {/* Painel traseiro (mais baixo/estreito que a coluna, sustenta a tela) */}
      <RoundedBox args={[0.85, 0.95, 0.06]} radius={0.02} smoothness={2} position={[-0.15, 0.62, -0.66]} castShadow>
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.5} metalness={0.1} />
      </RoundedBox>

      {/* Tela */}
      <mesh position={[-0.4, 0.72, -0.625]}>
        <boxGeometry args={[0.26, 0.18, 0.015]} />
        <meshStandardMaterial
          color={SCREEN_COLOR}
          emissive={SCREEN_COLOR}
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[-0.4, 0.72, -0.617]}>
        <planeGeometry args={[0.2, 0.13]} />
        <meshStandardMaterial color="#eaf6ff" emissive="#eaf6ff" emissiveIntensity={0.3} />
      </mesh>

      {/* Viga superior (gantry) — cantilever, sem apoio do lado esquerdo */}
      <RoundedBox args={[1.62, 0.1, 0.9]} radius={0.02} smoothness={2} position={[0.02, 1.55, -0.15]} castShadow>
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.35} />
      </RoundedBox>
      {/* Correia do eixo X (detalhe fino sob a viga) */}
      <mesh position={[0.02, 1.49, -0.15]}>
        <boxGeometry args={[1.58, 0.015, 0.02]} />
        <meshStandardMaterial color={BELT_COLOR} roughness={0.8} />
      </mesh>

      {/* Cabeçote de impressão */}
      <group position={[-0.15, 1.3, 0.08]}>
        <RoundedBox args={[0.22, 0.24, 0.26]} radius={0.03} smoothness={2} castShadow>
          <meshStandardMaterial color={DARK_COLOR} roughness={0.55} metalness={0.2} />
        </RoundedBox>
        {/* Ventoinha */}
        <mesh position={[0, 0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.03, 20]} />
          <meshStandardMaterial color="#3a3f47" roughness={0.6} />
        </mesh>
        {/* Bico */}
        <mesh position={[0, -0.17, 0]}>
          <coneGeometry args={[0.05, 0.11, 16]} />
          <meshStandardMaterial
            color={NOZZLE_COLOR}
            emissive={NOZZLE_COLOR}
            emissiveIntensity={0.25}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Suporte + carretéis de filamento externos (referência ao AMS lite) */}
      <mesh position={[0, 1.72, -0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.85, 8]} />
        <meshStandardMaterial color="#5b5f66" roughness={0.5} metalness={0.4} />
      </mesh>
      {SPOOLS.map((spool) => (
        <mesh
          key={spool.x}
          position={[spool.x, 1.72, -0.62]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.16, 0.16, 0.075, 28]} />
          <meshStandardMaterial color={spool.color} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
