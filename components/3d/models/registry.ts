import type { ComponentType } from "react";

import { BambuLabA1Model } from "@/components/3d/models/bambu-lab-a1-model";
import { DiLaboratorioHardwareModel } from "@/components/3d/models/di-laboratorio-hardware-model";
import { DiLaboratorioRedesModel } from "@/components/3d/models/di-laboratorio-redes-model";
import { DiOficinaModel } from "@/components/3d/models/di-oficina-model";
import { FlashforgeHunterModel } from "@/components/3d/models/flashforge-hunter-model";
import { KitArduinoModel } from "@/components/3d/models/kit-arduino-model";
import { KitEletronicaModel } from "@/components/3d/models/kit-eletronica-model";
import { OsciloscopioModel } from "@/components/3d/models/osciloscopio-model";
import { Sethi3DModel } from "@/components/3d/models/sethi3d-model";

export interface Resource3DCameraConfig {
  /** Posição inicial da câmera. */
  position: [number, number, number];
  /** Ponto para onde a câmera (e o OrbitControls) olha. */
  target: [number, number, number];
  /** Distância mínima/máxima de zoom permitida. */
  minDistance: number;
  maxDistance: number;
}

export interface Resource3DEntry {
  Model: ComponentType;
  camera: Resource3DCameraConfig;
}

const DEFAULT_CAMERA: Resource3DCameraConfig = {
  position: [2.3, 1.35, 2.7],
  target: [0, 0.55, -0.1],
  minDistance: 2,
  maxDistance: 4.5,
};

/** Câmera para objetos pequenos de bancada (osciloscópio, kits, impressoras). */
const TABLETOP_CAMERA: Resource3DCameraConfig = DEFAULT_CAMERA;

/** Câmera mais afastada/alta para cenas de ambiente (bancada + móveis). */
const ROOM_CAMERA: Resource3DCameraConfig = {
  position: [2.6, 2.0, 3.0],
  target: [0, 0.6, -0.2],
  minDistance: 2.6,
  maxDistance: 5.5,
};

export const RESOURCE_3D_MODELS: Record<string, Resource3DEntry> = {
  "bambu-lab-a1": {
    Model: BambuLabA1Model,
    camera: { ...TABLETOP_CAMERA, position: [2.5, 1.6, 2.9], target: [0, 0.8, -0.1] },
  },
  "flashforge-hunter-dlp": {
    Model: FlashforgeHunterModel,
    camera: { ...TABLETOP_CAMERA, position: [2.2, 1.5, 2.6], target: [0, 0.85, 0] },
  },
  sethi3d: {
    Model: Sethi3DModel,
    camera: { ...TABLETOP_CAMERA, position: [2.4, 1.6, 2.8], target: [0, 0.95, 0] },
  },
  osciloscopio: {
    Model: OsciloscopioModel,
    camera: { position: [0.9, 0.65, 1.35], target: [0, 0.4, 0.1], minDistance: 0.9, maxDistance: 2.4 },
  },
  "kit-arduino": {
    Model: KitArduinoModel,
    camera: { position: [1.4, 1.1, 1.5], target: [0, 0.05, 0], minDistance: 1, maxDistance: 2.6 },
  },
  "kit-eletronica": {
    Model: KitEletronicaModel,
    camera: { position: [1.5, 1.2, 1.6], target: [0, 0.05, 0], minDistance: 1, maxDistance: 2.8 },
  },
  "di-laboratorio-hardware": {
    Model: DiLaboratorioHardwareModel,
    camera: ROOM_CAMERA,
  },
  "di-laboratorio-redes": {
    Model: DiLaboratorioRedesModel,
    camera: ROOM_CAMERA,
  },
  "di-oficina-fabricacao-prototipagem": {
    Model: DiOficinaModel,
    camera: { ...ROOM_CAMERA, position: [2.8, 2.1, 3.2] },
  },
};

export function getResource3DEntry(slug: string): Resource3DEntry | null {
  return RESOURCE_3D_MODELS[slug] ?? null;
}
