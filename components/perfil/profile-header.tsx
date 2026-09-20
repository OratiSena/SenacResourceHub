import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function buildInitials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

interface ProfileHeaderProps {
  nome: string;
  email: string;
  roleLabel: string;
  isAdmin: boolean;
  status: "active" | "deleted";
}

/**
 * Card de identidade no topo do Perfil — avatar com iniciais (nunca uma
 * foto inventada), nome, e-mail e papel amigável. Mesma lógica de iniciais
 * usada em app/(app)/layout.tsx (AppShell), reaproveitada aqui só
 * visualmente, sem tocar no layout compartilhado.
 */
export function ProfileHeader({
  nome,
  email,
  roleLabel,
  isAdmin,
  status,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-navy/5 p-6 text-center sm:flex-row sm:text-left">
      <Avatar className="size-16 sm:size-20">
        <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground sm:text-xl">
          {buildInitials(nome)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-navy">{nome}</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badge
            variant="outline"
            className={
              isAdmin
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-info/20 bg-info/10 text-info"
            }
          >
            {roleLabel}
          </Badge>
          {status !== "active" ? (
            <Badge
              variant="outline"
              className="border-destructive/20 bg-destructive/10 text-destructive"
            >
              Conta encerrada
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
