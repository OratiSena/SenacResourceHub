/**
 * Peças pequenas reaproveitadas por vários modelos 3D procedurais (osciloscópio,
 * kits, cenas de laboratório/oficina) — evita repetir a mesma composição de
 * primitivas em cada arquivo. Nada aqui depende de asset externo (GLB/textura/
 * fonte) — só geometria e material do Three.js, na mesma linha do resto de
 * `components/3d/models/`.
 */

export function Led({
  position,
  color = "#38a169",
  intensity = 0.8,
  radius = 0.02,
}: {
  position: [number, number, number];
  color?: string;
  intensity?: number;
  radius?: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
    </mesh>
  );
}

/** Um "vinco" retangular emissivo — tela simples, indicador de status, etc. */
export function Glow({
  position,
  rotation,
  size = [0.2, 0.12],
  color = "#147eb3",
  intensity = 0.5,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  color?: string;
  intensity?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} side={2} />
    </mesh>
  );
}

/** Cilindro fino curvado em segmentos — sugere um cabo/fio sem física real. */
export function CableArc({
  from,
  to,
  height = 0.15,
  color = "#2a2d31",
  radius = 0.012,
  segments = 8,
}: {
  from: [number, number, number];
  to: [number, number, number];
  height?: number;
  color?: string;
  radius?: number;
  segments?: number;
}) {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = from[0] + (to[0] - from[0]) * t;
    const z = from[2] + (to[2] - from[2]) * t;
    const y = from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * height;
    points.push([x, y, z]);
  }

  return (
    <>
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const dx = next[0] - p[0];
        const dy = next[1] - p[1];
        const dz = next[2] - p[2];
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const midpoint: [number, number, number] = [
          p[0] + dx / 2,
          p[1] + dy / 2,
          p[2] + dz / 2,
        ];
        const rotY = Math.atan2(dx, dz);
        const rotX = Math.atan2(Math.sqrt(dx * dx + dz * dz), dy) - Math.PI / 2;
        return (
          <mesh key={i} position={midpoint} rotation={[rotX, rotY, 0]}>
            <cylinderGeometry args={[radius, radius, length, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        );
      })}
    </>
  );
}
