/**
 * Fotos reais de produto usadas nos cards (Home/Recursos) para recursos
 * "genéricos" onde existe uma fonte segura e licenciada (Wikimedia Commons,
 * CC BY / CC BY-SA) — nunca hotlinkadas, sempre baixadas para
 * `public/imagens/`. Recursos de marca específica (Bambu Lab A1, Flashforge
 * Hunter DLP, Sethi3D) e os ambientes (laboratórios, Oficina) continuam
 * usando ilustração/3D próprios — ver documentacao/decisoes/modelos-3d.md
 * para o registro completo de origem/licença de cada arquivo.
 */
export interface ResourcePhoto {
  src: string;
  alt: string;
  credit: string;
}

export const RESOURCE_PHOTOS: Record<string, ResourcePhoto> = {
  "kit-arduino": {
    src: "/imagens/kit-arduino.jpg",
    alt: "Placa Arduino Uno R3 sobre fundo branco",
    credit: '"Arduino Uno - R3" by SparkFun Electronics, licensed under CC BY 2.0',
  },
  osciloscopio: {
    src: "/imagens/osciloscopio.jpg",
    alt: "Osciloscópio digital de bancada Agilent DSO6052A",
    credit:
      '"Agilent Technologies DSO6052A Oscilloscope" by transcript, licensed under CC BY 2.0',
  },
  "kit-eletronica": {
    src: "/imagens/kit-eletronica.jpg",
    alt: "Protoboard (placa de contato) de 400 pontos",
    credit: '"400 points breadboard" by oomlout, licensed under CC BY-SA 2.0',
  },
};
