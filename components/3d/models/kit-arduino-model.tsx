import { Led } from "@/components/3d/models/primitives";

const PCB_COLOR = "#0f7c4d";
const CHIP_COLOR = "#1c1c1e";
const SILVER = "#c9cdd3";

const HEADER_ROWS = [
  { z: 0.42, count: 8 },
  { z: -0.42, count: 10 },
] as const;

/**
 * Representação 3D procedural de uma placa estilo Arduino Uno — recurso
 * "Kit Arduino" no catálogo (10 unidades). Procedural por decisão de
 * projeto (ver documentacao/decisoes/modelos-3d.md), pensada para ser
 * reconhecível pela cor verde característica da PCB, o chip preto central,
 * a porta USB e os pinos ao longo das bordas — não reproduz a serigrafia
 * oficial.
 */
export function KitArduinoModel() {
  return (
    <group position={[0, 0.02, 0]} rotation={[0, 0.15, 0]}>
      {/* Placa (PCB) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.045, 1.0]} />
        <meshStandardMaterial color={PCB_COLOR} roughness={0.55} metalness={0.1} />
      </mesh>

      {/* Chip principal (microcontrolador) */}
      <mesh position={[0.1, 0.035, 0.05]} castShadow>
        <boxGeometry args={[0.24, 0.035, 0.18]} />
        <meshStandardMaterial color={CHIP_COLOR} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Porta USB */}
      <mesh position={[-0.62, 0.06, -0.28]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.22]} />
        <meshStandardMaterial color={SILVER} roughness={0.35} metalness={0.6} />
      </mesh>

      {/* Conector de alimentação (barrel jack) */}
      <mesh position={[-0.62, 0.05, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        <meshStandardMaterial color="#2a2d31" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Botão de reset */}
      <mesh position={[0.35, 0.045, -0.4]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
        <meshStandardMaterial color="#c94040" roughness={0.4} />
      </mesh>

      {/* Fileiras de pinos (headers) nas bordas longitudinais */}
      {HEADER_ROWS.map((row) =>
        Array.from({ length: row.count }, (_, i) => {
          const x = -0.55 + (i * 1.1) / (row.count - 1);
          return (
            <mesh key={`${row.z}-${i}`} position={[x, 0.055, row.z]}>
              <boxGeometry args={[0.035, 0.05, 0.035]} />
              <meshStandardMaterial color={CHIP_COLOR} roughness={0.4} metalness={0.5} />
            </mesh>
          );
        }),
      )}

      {/* Cristal oscilador */}
      <mesh position={[0.28, 0.045, 0.28]} castShadow>
        <boxGeometry args={[0.09, 0.05, 0.05]} />
        <meshStandardMaterial color={SILVER} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* LED indicador (pino 13) */}
      <Led position={[0.5, 0.03, -0.1]} color="#f28c28" intensity={0.9} radius={0.02} />
      <Led position={[-0.15, 0.03, -0.05]} color="#38a169" intensity={0.7} radius={0.016} />
    </group>
  );
}
