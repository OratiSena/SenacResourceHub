"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

import { Viewer3DFallback } from "@/components/3d/viewer-3d-fallback";

// `ssr: false` só é permitido a partir de um Client Component — por isso
// este arquivo existe separado de resource-3d-viewer.tsx, que é importado
// pela página de detalhe (Server Component). Isso também garante que
// three.js/@react-three/fiber nunca entram no bundle/SSR de nenhuma outra
// página (Prompt 6, seção 12).
const Resource3DViewer = dynamic(
  () => import("@/components/3d/resource-3d-viewer").then((m) => m.Resource3DViewer),
  { ssr: false },
);

export function Resource3DViewerLoader({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  return (
    <Suspense fallback={<Viewer3DFallback label={label} reason="loading" />}>
      <Resource3DViewer slug={slug} label={label} />
    </Suspense>
  );
}
