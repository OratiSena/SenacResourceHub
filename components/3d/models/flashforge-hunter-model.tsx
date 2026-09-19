import { RoundedBox } from "@react-three/drei";
import { Glow, Led } from "@/components/3d/models/primitives";

const BODY_COLOR = "#e4e6ea";
const BASE_COLOR = "#2c2f34";
const WINDOW_COLOR = "#d97b2a";

/**
 * Representação 3D procedural da Flashforge Hunter DLP — impressora de
 * resina com gabinete fechado. Procedural por decisão (ver
 * documentacao/decisoes/modelos-3d.md), não um CAD oficial do fabricante.
 * Traços reconhecíveis: gabinete fechado com janela frontal escurecida
 * (proteção contra luz UV), base com o vat de resina e a plataforma de
 * impressão suspensa por cima, painel de controle no topo.
 */
export function FlashforgeHunterModel() {
  return (
    <group position={[0, -0.02, 0]}>
      {/* Base */}
      <RoundedBox args={[1.15, 0.22, 1.0]} radius={0.03} smoothness={2} position={[0, 0.11, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BASE_COLOR} roughness={0.5} metalness={0.2} />
      </RoundedBox>

      {/* Gabinete principal */}
      <RoundedBox args={[1.0, 1.25, 0.9]} radius={0.04} smoothness={2} position={[0, 0.85, 0]} castShadow>
        <meshStandardMaterial color={BODY_COLOR} roughness={0.45} metalness={0.1} />
      </RoundedBox>

      {/* Janela frontal escurecida (protege a resina da luz) */}
      <mesh position={[0, 0.85, 0.455]}>
        <planeGeometry args={[0.8, 1.0]} />
        <meshPhysicalMaterial
          color={WINDOW_COLOR}
          transparent
          opacity={0.55}
          roughness={0.15}
          metalness={0}
          transmission={0.4}
        />
      </mesh>

      {/* Plataforma de impressão suspensa (visível através da janela) */}
      <mesh position={[0, 0.95, 0.1]} castShadow>
        <boxGeometry args={[0.5, 0.03, 0.4]} />
        <meshStandardMaterial color="#8a8f97" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.08, 0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#8a8f97" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Vat de resina (base do gabinete, sugerido) */}
      <mesh position={[0, 0.42, 0.05]}>
        <boxGeometry args={[0.55, 0.12, 0.45]} />
        <meshStandardMaterial color="#c96a1e" transparent opacity={0.5} roughness={0.2} />
      </mesh>

      {/* Painel de controle no topo */}
      <RoundedBox args={[0.95, 0.1, 0.85]} radius={0.02} smoothness={2} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial color={BASE_COLOR} roughness={0.5} metalness={0.2} />
      </RoundedBox>
      <Glow position={[-0.25, 1.555, 0.15]} rotation={[-Math.PI / 2, 0, 0]} size={[0.32, 0.2]} color="#147eb3" intensity={0.55} />
      <Led position={[0.28, 1.555, 0.3]} color="#38a169" intensity={1} radius={0.018} />
      <Led position={[0.28, 1.555, 0.22]} color="#f28c28" intensity={0.7} radius={0.018} />
    </group>
  );
}
