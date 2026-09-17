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
 * Câmera, luzes e OrbitControls ficam aqui; o modelo em si vem do registro
 * por slug, para não precisar tocar neste arquivo ao adicionar outro
 * recurso 3D depois.
 */
export function Resource3DViewer({ slug, label }: Resource3DViewerProps) {
  const Model = RESOURCE_3D_MODELS[slug];

  if (!Model) {
    return <Viewer3DFallback label={label} reason="erro" />;
  }

  return (
    <div
      className="relative size-full"
      role="img"
      aria-label={`Visualização 3D interativa de ${label}. Arraste para girar, use a roda do mouse para aproximar.`}
    >
      <ModelErrorBoundary fallback={<Viewer3DFallback label={label} reason="erro" />}>
        <Canvas
          shadows
          camera={{ position: [2.3, 1.35, 2.7], fov: 38 }}
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
            target={[0, 0.55, -0.1]}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.6}
            minDistance={2}
            maxDistance={4.5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
      </ModelErrorBoundary>
      <span className="sr-only">
        {label}: representação 3D ilustrativa gerada com formas simples, não é
        o modelo CAD oficial do fabricante. Todas as informações deste
        recurso também estão disponíveis em texto nesta página.
      </span>
    </div>
  );
}
