import { CalendarCheck, LayoutGrid, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: CalendarCheck, label: "Reserve com facilidade" },
  { icon: LayoutGrid, label: "Diversos recursos para seus projetos" },
  { icon: ShieldCheck, label: "Laboratórios sempre disponíveis" },
];

/**
 * Painel de marca do lado esquerdo das telas públicas de autenticação
 * (Prompt 4, seção 20). Sem fotos de produto reais ainda — usa formas
 * decorativas sutis em CSS em vez de imagens fictícias, evitando
 * glassmorphism/gradiente exagerado.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-navy lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-blue/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-orange/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue text-sm font-bold text-white">
            RH
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-white">
              Senac ResourceHub
            </p>
            <p className="text-xs text-white/60">
              Sistema de Reservas de Laboratórios e Equipamentos
            </p>
          </div>
        </div>

        <h1 className="mt-16 max-w-md text-3xl leading-tight font-bold text-white xl:text-4xl">
          Acesso facilitado aos laboratórios e equipamentos do Senac.
        </h1>
        <p className="mt-4 max-w-sm text-sm text-white/70">
          Reserve, planeje e utilize recursos de ponta para transformar ideias
          em aprendizado e projetos.
        </p>

        <ul className="mt-10 space-y-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-white/90">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/50 italic">
        &ldquo;Grandes ideias ganham forma quando você tem os recursos
        certos.&rdquo;
      </p>
    </div>
  );
}
