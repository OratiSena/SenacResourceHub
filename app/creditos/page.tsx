import { LegalPage } from "@/components/common/legal-page";

interface CreditEntry {
  nome: string;
  descricao: string;
  autor: string;
  fonte: string;
  fonteUrl: string;
  licenca: string;
}

/**
 * As únicas 3 fotos externas usadas no sistema (cards de Kit Arduino,
 * Osciloscópio e Kit de Eletrônica) — registro de origem em
 * `documentacao/decisoes/modelos-3d.md` e `lib/resources/resource-photos.ts`.
 * Todos os demais recursos usam ilustração/3D próprios, sem atribuição
 * necessária.
 */
const CREDITS: CreditEntry[] = [
  {
    nome: "Kit Arduino",
    descricao: "Foto usada no card do recurso Kit Arduino.",
    autor: "SparkFun Electronics",
    fonte: "Wikimedia Commons — \"Arduino Uno - R3\"",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Arduino_Uno_-_R3.jpg",
    licenca: "CC BY 2.0",
  },
  {
    nome: "Osciloscópio",
    descricao: "Foto usada no card do recurso Osciloscópio.",
    autor: "transcript (Flickr)",
    fonte:
      "Wikimedia Commons — \"Agilent Technologies DSO6052A Oscilloscope\"",
    fonteUrl:
      "https://commons.wikimedia.org/wiki/File:Agilent_Technologies_DSO6052A_Oscilloscope.jpg",
    licenca: "CC BY 2.0",
  },
  {
    nome: "Kit de Eletrônica",
    descricao: "Foto usada no card do recurso Kit de Eletrônica.",
    autor: "oomlout",
    fonte: "Wikimedia Commons — \"400 points breadboard\"",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:400_points_breadboard.jpg",
    licenca: "CC BY-SA 2.0",
  },
];

export default function CreditosPage() {
  return (
    <LegalPage
      title="Créditos e Licenças"
      subtitle="Origem e licença das imagens externas utilizadas no Senac ResourceHub."
      backHref="/"
      backLabel="Voltar"
    >
      <p>
        Os demais recursos do catálogo usam ilustrações e cenas 3D criadas
        especificamente para este projeto (sem asset externo, portanto sem
        necessidade de atribuição). Abaixo estão listadas apenas as imagens
        de terceiros efetivamente usadas no sistema.
      </p>

      <div className="space-y-4">
        {CREDITS.map((credit) => (
          <div
            key={credit.nome}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <h2 className="font-semibold text-navy">{credit.nome}</h2>
            <p className="text-xs text-muted-foreground">{credit.descricao}</p>
            <dl className="mt-3 grid gap-1.5 text-xs sm:grid-cols-[auto_1fr] sm:gap-x-3">
              <dt className="font-medium text-muted-foreground">Autor</dt>
              <dd className="text-foreground">{credit.autor}</dd>
              <dt className="font-medium text-muted-foreground">Fonte</dt>
              <dd className="text-foreground">
                <a
                  href={credit.fonteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {credit.fonte}
                </a>
              </dd>
              <dt className="font-medium text-muted-foreground">Licença</dt>
              <dd className="text-foreground">{credit.licenca}</dd>
            </dl>
          </div>
        ))}
      </div>
    </LegalPage>
  );
}
