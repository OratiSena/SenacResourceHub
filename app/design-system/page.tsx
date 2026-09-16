import type { ReactNode } from "react";
import { AlertTriangle, Boxes, CalendarClock, Trash2, Wrench } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { ResourceCard } from "@/components/common/resource-card";
import {
  ResourceStatus,
  type ResourceStatusValue,
} from "@/components/common/resource-status";

const STATUS_VALUES: ResourceStatusValue[] = [
  "disponivel",
  "reservado",
  "manutencao",
  "inativo",
  "ativo",
  "cancelado",
];

const PALETTE = [
  { name: "Navy", varName: "--navy", className: "bg-navy" },
  { name: "Blue", varName: "--blue", className: "bg-blue" },
  { name: "Orange", varName: "--orange", className: "bg-orange" },
  { name: "Background", varName: "--background", className: "bg-background border border-border" },
  { name: "White", varName: "--card", className: "bg-white border border-border" },
  { name: "Graphite", varName: "--graphite", className: "bg-graphite" },
  { name: "Success", varName: "--success", className: "bg-success" },
  { name: "Warning", varName: "--warning", className: "bg-warning" },
  { name: "Danger", varName: "--destructive", className: "bg-destructive" },
  { name: "Info", varName: "--info", className: "bg-info" },
  { name: "Muted", varName: "--muted", className: "bg-muted border border-border" },
  { name: "Border", varName: "--border", className: "bg-border" },
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        eyebrow="Desenvolvimento"
        title="Design System"
        description="Rota interna para validar tokens visuais e componentes-base antes de construir as telas finais. Não faz parte da navegação do produto."
      />

      <Section
        title="Sidebar, header e app shell"
        description="Já visíveis nesta própria página: a sidebar navy à esquerda (ou no menu ☰ em telas estreitas) e o header no topo são o AppShell real, não uma reprodução."
      >
        <EmptyState
          title="Isto aqui é o conteúdo"
          description="Tudo ao redor desta página — sidebar e topbar — é o mesmo AppShell que será reaproveitado nas telas finais do produto."
        />
      </Section>

      <Section title="Paleta" description="Tokens definidos em app/globals.css.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`h-16 rounded-lg ${color.className}`} />
              <div>
                <p className="text-sm font-medium">{color.name}</p>
                <p className="text-xs text-muted-foreground">{color.varName}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Tipografia"
        description="Hierarquia usada em todo o produto — evitar tamanhos fora desta escala."
      >
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <p className="text-4xl font-bold text-navy">Display</p>
          <p className="text-3xl font-bold text-navy">Heading 1</p>
          <p className="text-2xl font-semibold text-navy">Heading 2</p>
          <p className="text-lg font-semibold text-navy">Heading 3</p>
          <p className="text-sm text-foreground">
            Body — texto padrão de parágrafos e conteúdo geral da interface.
          </p>
          <p className="text-xs text-muted-foreground">
            Small — legendas de apoio, metadados e textos secundários.
          </p>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Caption — rótulos pequenos em maiúsculas
          </p>
        </div>
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">
            <Trash2 />
            Destructive
          </Button>
          <Button variant="link">Link</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Section>

      <Section
        title="Badges de status"
        description="Cor + ícone + texto — nunca só a cor comunica o estado."
      >
        <div className="flex flex-wrap gap-2">
          {STATUS_VALUES.map((status) => (
            <ResourceStatus key={status} status={status} />
          ))}
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ds-input-normal">Nome completo</Label>
            <Input id="ds-input-normal" placeholder="Seu nome" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-input-disabled">Matrícula (bloqueado)</Label>
            <Input id="ds-input-disabled" disabled value="2023123456" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-input-error">E-mail</Label>
            <Input
              id="ds-input-error"
              aria-invalid="true"
              defaultValue="email-invalido"
            />
            <p className="text-xs text-destructive">
              Informe um e-mail válido.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-input-focus">Finalidade do uso</Label>
            <Input id="ds-input-focus" placeholder="Ex.: Projeto acadêmico" />
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card padrão</CardTitle>
              <CardDescription>
                Usado para agrupar qualquer conteúdo simples.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Conteúdo livre dentro do card.
            </CardContent>
          </Card>

          <MetricCard icon={Boxes} label="Total de recursos" value={9} />
          <MetricCard
            icon={CalendarClock}
            label="Minhas reservas ativas"
            value={2}
            hint="Em andamento"
          />
        </div>
      </Section>

      <Section
        title="Resource Card"
        description="Área de mídia flexível (media?: ReactNode) — hoje mostra um placeholder ou uma cor sólida; no Prompt 6 a mesma prop recebe o preview 3D do Bambu Lab A1."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCard
            category="Equipamento"
            name="Osciloscópio"
            description="Equipamento de medição para análise de sinais elétricos."
            totalUnits={12}
            availableUnits={5}
            status="disponivel"
            action={
              <Button size="sm" className="w-full">
                Ver horários
              </Button>
            }
          />
          <ResourceCard
            category="Impressora 3D"
            name="Bambu Lab A1"
            description="Impressora 3D FDM de alta velocidade com sistema AMS."
            totalUnits={3}
            availableUnits={1}
            status="reservado"
            media={
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 to-navy/10 text-xs font-medium text-navy">
                preview 3D (Prompt 6)
              </div>
            }
            action={
              <Button size="sm" variant="outline" className="w-full">
                Detalhes
              </Button>
            }
          />
          <ResourceCard
            category="Espaço compartilhado"
            name="DI — Oficina de Fabricação e Prototipagem"
            description="Uso orientado, sem exclusividade de horário."
            status="manutencao"
            action={
              <Button size="sm" variant="outline" className="w-full">
                Agendar uso orientado
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="Skeleton / loading">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-3">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Section>

      <Section title="Estados de feedback">
        <div className="grid gap-4 lg:grid-cols-3">
          <EmptyState
            title="Sem reservas"
            description="Você ainda não tem nenhuma reserva ativa."
            action={<Button size="sm">Explorar recursos</Button>}
          />
          <EmptyState
            tone="error"
            icon={AlertTriangle}
            title="Não foi possível carregar"
            description="Tente novamente em instantes."
            action={
              <Button size="sm" variant="outline">
                Tentar novamente
              </Button>
            }
          />
          <EmptyState
            tone="success"
            title="Reserva confirmada"
            description="Seu agendamento foi realizado com sucesso."
          />
        </div>
      </Section>

      <Section
        title="Modais de confirmação"
        description="Mesma base (ConfirmDialog), variando o tom para ações destrutivas."
      >
        <div className="flex flex-wrap gap-3">
          <ConfirmDialog
            trigger={<Button variant="outline">Cancelar reserva</Button>}
            title="Cancelar esta reserva?"
            description="Esta ação não pode ser desfeita. O horário voltará a ficar disponível para outros usuários."
            confirmLabel="Sim, cancelar"
            cancelLabel="Voltar"
          />
          <ConfirmDialog
            trigger={
              <Button variant="destructive">
                <Wrench />
                Excluir conta
              </Button>
            }
            title="Excluir sua conta?"
            description="Esta ação é permanente. Seus dados de perfil serão anonimizados e você não poderá mais acessar o sistema."
            confirmLabel="Excluir permanentemente"
            cancelLabel="Manter minha conta"
            destructive
          />
        </div>
      </Section>

      <Section title="Avatar e tooltip">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              VS
            </AvatarFallback>
          </Avatar>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Passe o mouse aqui
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exemplo de tooltip</TooltipContent>
          </Tooltip>
        </div>
      </Section>
    </div>
  );
}
