"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

import { ModelErrorBoundary } from "@/components/3d/model-error-boundary";
import { RESOURCE_3D_MODELS } from "@/components/3d/models/registry";
import { Viewer3DFallback } from "@/components/3d/viewer-3d-fallback";

interface Resource3DViewerProps {
  slug: string;
  label: string;
}

/**
 * Cena 3D de verdade — só é importada no navegador (ver
 * resource-3d-viewer-loader.tsx, que faz o dynamic import com ssr:false).
 * Câmera, luzes e OrbitControls ficam aqui; o modelo em si e o enquadramento
 * inicial de câmera vêm do registro por slug (`RESOURCE_3D_MODELS`), para
 * não precisar tocar neste arquivo ao adicionar outro recurso 3D depois.
 */
export function Resource3DViewer({ slug, label }: Resource3DViewerProps) {
  const entry = RESOURCE_3D_MODELS[slug];

  if (!entry) {
    return <Viewer3DFallback label={label} reason="erro" />;
  }

  const { Model, camera } = entry;

  return (
    <div
      className="relative size-full"
      role="img"
      aria-label={`Visualização 3D interativa de ${label}. Arraste para girar, use a roda do mouse para ampliar.`}
    >
      <ModelErrorBoundary fallback={<Viewer3DFallback label={label} reason="erro" />}>
        <Canvas
          shadows
          camera={{ position: camera.position, fov: 38 }}
          dpr={[1, 1.5]}
          className="bg-gradient-to-br from-primary/10 via-background to-navy/5"
          fallback={<Viewer3DFallback label={label} reason="unsupported" />}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
          <directionalLight position={[-4, 2, -4]} intensity={0.35} />
          <Suspense fallback={null}>
            <Model />
            <ContactShadows
              position={[0, -0.02, 0]}
              opacity={0.35}
              blur={2.4}
              scale={6}
              far={2}
            />
          </Suspense>
          <OrbitControls
            target={camera.target}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.6}
            minDistance={camera.minDistance}
            maxDistance={camera.maxDistance}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
      </ModelErrorBoundary>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
        <span className="rounded-full bg-navy/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          Arraste para girar · role para ampliar
        </span>
      </div>
      <span className="sr-only">
        {label}: representação 3D ilustrativa gerada com formas simples, não
        reproduz fielmente o objeto ou ambiente real. Todas as informações
        deste recurso também estão disponíveis em texto nesta página.
      </span>
    </div>
  );
}
